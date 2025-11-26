import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import getStripe from '../../../../lib/stripe';
import { SubscriptionService } from '../../../../lib/subscription-service';
import { SubscriptionTier, BillingInterval, normalizeTier, getTierIntervalByPriceId } from '../../../../lib/subscription-config';
import { fetchSubscriptionWithPrices, tierIntervalFromPrice } from '../../../../lib/stripe-utils';
import { getAdminSupabase } from '../../../../lib/supabase/admin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const log = (message: string, context: Record<string, any> = {}) => {
  console.log('[stripe-webhook]', message, JSON.stringify(context));
};

// Helper to convert Unix timestamp to Date
const toDateOrNull = (timestamp?: number | string | null) => {
  const n = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
  return typeof n === 'number' && !Number.isNaN(n) ? new Date(n * 1000) : null;
};

// Helper to get Stripe customer ID from subscription
const getStripeCustomerId = (subscription: Stripe.Subscription): string | null => {
  if (typeof subscription.customer === 'string') {
    return subscription.customer;
  }
  return subscription.customer?.id ?? null;
};

// Resolve tier & interval from metadata first, then price ID fallback
const resolveTierAndInterval = (
  metadata: Stripe.Metadata | null | undefined,
  price?: Stripe.Price | null,
  fallbackPriceId?: string | null
): { tier: SubscriptionTier; billingInterval: BillingInterval } => {
  // 1) Prefer explicit price ID mapping (env)
  const explicitPriceId = price?.id || fallbackPriceId || null;
  if (explicitPriceId) {
    const mapped = getTierIntervalByPriceId(explicitPriceId);
    if (mapped) return { tier: mapped.tier, billingInterval: mapped.interval };
  }

  // 2) Use product metadata tier_key + recurring interval
  const { interval, tierKey, priceId } = tierIntervalFromPrice(price);
  if (priceId) {
    const mapped = getTierIntervalByPriceId(priceId);
    if (mapped) return { tier: mapped.tier, billingInterval: mapped.interval };
  }
  if (tierKey && interval) {
    return { tier: normalizeTier(tierKey), billingInterval: interval };
  }

  // 3) Fallback to metadata
  const tierMeta = metadata?.tier ? normalizeTier(metadata.tier) : 'free';
  const intervalMeta =
    (priceInterval as BillingInterval) ||
    (metadata?.billingInterval as BillingInterval) ||
    'month';
  return { tier: tierMeta, billingInterval: intervalMeta };
};

// Resolve period start/end with fallbacks (subscription -> invoice line item)
const getPeriodDates = (
  subscription?: Partial<Stripe.Subscription> | null,
  invoice?: Partial<Stripe.Invoice> | null,
  interval?: BillingInterval | null
) => {
  const startSeconds =
    (subscription as any)?.current_period_start ??
    invoice?.lines?.data?.[0]?.period?.start ??
    invoice?.period_start;

  const endSeconds =
    (subscription as any)?.current_period_end ??
    invoice?.lines?.data?.[0]?.period?.end ??
    invoice?.period_end;

  let start = toDateOrNull(startSeconds as number | undefined);
  let end = toDateOrNull(endSeconds as number | undefined);

  // Fallback: derive end from interval if missing
  const effectiveInterval = interval || 'month';
  if (!start || !end) {
    const base = start || new Date();
    const derivedEnd = new Date(base);
    if (effectiveInterval === 'year') {
      derivedEnd.setFullYear(derivedEnd.getFullYear() + 1);
    } else {
      derivedEnd.setMonth(derivedEnd.getMonth() + 1);
    }
    start = start || base;
    end = end || derivedEnd;
  }

  // Final guard: never return nulls
  if (!start || !end) {
    const now = new Date();
    const future = new Date(now);
    future.setMonth(future.getMonth() + 1);
    start = start || now;
    end = end || future;
  }

  return { start, end };
};

// Resolve user ID from Stripe metadata or customer ID
const resolveUserId = async (
  subscription: Stripe.Subscription,
  metadata: Stripe.Metadata | null | undefined
): Promise<string | null> => {
  const supabase = getAdminSupabase();

  // Try metadata first
  if (metadata?.userId) {
    return metadata.userId;
  }

  // Try to find user by Stripe customer ID
  const customerId = getStripeCustomerId(subscription);
  if (customerId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      return profile.id;
    }
  }

  return null;
};

const fetchProfile = async (userId: string) => {
  const supabase = getAdminSupabase();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing stripe signature or webhook secret');
    return NextResponse.json(
      { error: 'Webhook authentication failed' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        // Skip duplicate invoice events when subscription.updated will handle the latest state
        // but still refresh credits using current subscription item price to avoid stale invoice prices
        // Explicitly add optional subscription field for TS compatibility across Stripe versions
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };

        if (!invoice.subscription) {
          throw new Error('No subscription ID in invoice');
        }

        const subscription = await fetchSubscriptionWithPrices(invoice.subscription as string);

        const subCast1 = subscription as unknown as Stripe.Subscription;
        const metadata = {
          ...(subCast1.metadata ?? {}),
          ...(invoice.metadata ?? {}),
        };
        // Always trust live subscription item price to avoid stale invoice-line prices
        const price = subCast1.items?.data?.[0]?.price as Stripe.Price | undefined;
        const fallbackPriceId = price?.id;

        const userId = await resolveUserId(subscription, metadata);
        if (!userId) {
          throw new Error('Unable to resolve user ID from subscription');
        }

        const { tier, billingInterval } = resolveTierAndInterval(metadata, price, fallbackPriceId);
        const status = subCast1.status.toUpperCase();

        const { start: periodStart, end: periodEnd } = getPeriodDates(subCast1, invoice, billingInterval);

        if (!periodStart || !periodEnd) {
          throw new Error('Invalid subscription period dates');
        }

        // If profile is missing subscription linkage or canceled, update it here (first activation)
        const profile = await fetchProfile(userId);
        const activeStatuses = ['active', 'trialing'];
        await SubscriptionService.updateSubscription(supabase, userId, {
          stripeSubscriptionId: subCast1.id,
          tier,
          status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          billingInterval,
        });

        // Always refresh credits
        await SubscriptionService.updateUserCredits(supabase, userId, tier, billingInterval);

        await SubscriptionService.recordSubscriptionSnapshot(supabase, {
          userId,
          stripeSubscriptionId: subCast1.id,
          tier,
          status,
          billingInterval,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          event: 'invoice.payment_succeeded',
          rawPayload: subscription,
        });

        log('invoice.payment_succeeded processed', {
          userId,
          tier,
          billingInterval,
          subscriptionId: subCast1.id,
          periodStart,
          periodEnd,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };

        if (!invoice.subscription) {
          throw new Error('No subscription ID in invoice');
        }

        const subscription = await fetchSubscriptionWithPrices(invoice.subscription as string);

        const subCast2 = subscription as any;
        const metadata = {
          ...(subCast2.metadata ?? {}),
          ...(invoice.metadata ?? {}),
        };
        const price = subCast2.items?.data?.[0]?.price as Stripe.Price | undefined;
        const fallbackPriceId = price?.id;

        const userId = await resolveUserId(subscription, metadata);
        if (!userId) {
          throw new Error('Unable to resolve user ID from subscription');
        }

        const { tier, billingInterval } = resolveTierAndInterval(metadata, price, fallbackPriceId);
        const { start: periodStart, end: periodEnd } = getPeriodDates(subCast2, invoice, billingInterval);

        if (!periodStart || !periodEnd) {
          throw new Error('Invalid subscription period dates');
        }

        // Update credits/status minimally
        await SubscriptionService.updateUserCredits(supabase, userId, tier, billingInterval);

        await SubscriptionService.recordSubscriptionSnapshot(supabase, {
          userId,
          stripeSubscriptionId: subCast2.id,
          tier,
          status: 'PAST_DUE',
          billingInterval,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          event: 'invoice.payment_failed',
          rawPayload: subscription,
        });

        log('invoice.payment_failed processed', {
          userId,
          tier,
          subscriptionId: subCast2.id,
          periodStart,
          periodEnd,
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = await fetchSubscriptionWithPrices((event.data.object as Stripe.Subscription).id);
        const metadata = subscription.metadata ?? {};
        const price = subscription.items?.data?.[0]?.price as Stripe.Price | undefined;
        const fallbackPriceId = subscription.items?.data?.[0]?.price?.id;

        const userId = await resolveUserId(subscription, metadata);
        if (!userId) {
          throw new Error('Unable to resolve user ID from subscription');
        }

        const { tier, billingInterval } = resolveTierAndInterval(metadata, price, fallbackPriceId);
        const status = subscription.status.toUpperCase();

        const { start: periodStart, end: periodEnd } = getPeriodDates(subscription, null, billingInterval);

        if (!periodStart || !periodEnd) {
          throw new Error('Invalid subscription period dates');
        }

        await SubscriptionService.updateSubscription(supabase, userId, {
          stripeSubscriptionId: subscription.id,
          tier,
          status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          billingInterval,
        });

        if (subscription.status === 'active') {
          await SubscriptionService.updateUserCredits(supabase, userId, tier, billingInterval);
        }

        await SubscriptionService.recordSubscriptionSnapshot(supabase, {
          userId,
          stripeSubscriptionId: subscription.id,
          tier,
          status,
          billingInterval,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          event: 'customer.subscription.updated',
          rawPayload: subscription,
        });

        log('customer.subscription.updated processed', {
          userId,
          tier,
          billingInterval,
          subscriptionId: subscription.id,
          status,
          periodStart,
          periodEnd,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = await fetchSubscriptionWithPrices((event.data.object as Stripe.Subscription).id);
        const metadata = subscription.metadata ?? {};
        const price = subscription.items?.data?.[0]?.price as Stripe.Price | undefined;

        const userId = await resolveUserId(subscription, metadata);
        if (!userId) {
          console.warn('Unable to resolve user ID for subscription deletion');
          break;
        }

        const { tier, billingInterval } = resolveTierAndInterval(metadata, price);
        const { start: periodStart, end: periodEnd } = getPeriodDates(subscription, null, billingInterval);

        // Cancel subscription in database
        await SubscriptionService.cancelSubscription(supabase, userId);
        await SubscriptionService.updateUserCredits(supabase, userId, 'free', 'month');

        await SubscriptionService.recordSubscriptionSnapshot(supabase, {
          userId,
          stripeSubscriptionId: subscription.id,
          tier,
          status: 'canceled',
          billingInterval,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          event: 'customer.subscription.deleted',
          rawPayload: subscription,
        });

        log('customer.subscription.deleted processed', {
          userId,
          subscriptionId: subscription.id,
        });
        break;
      }

      case 'checkout.session.completed': {
        // Session completed - subscription lifecycle handled by invoice events
        log('checkout.session.completed received', { sessionId: event.data.object.id });
        break;
      }

      default:
        // Gracefully ignore other events (e.g., invoice_payment.paid)
        log(`Unhandled event type ignored: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error processing webhook ${event.type}:`, error.message, {
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' });
}
