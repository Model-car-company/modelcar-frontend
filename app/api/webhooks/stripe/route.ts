import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '../../../../lib/supabase/server';
import getStripe from '../../../../lib/stripe';
import { SubscriptionService } from '../../../../lib/subscription-service';
import { SubscriptionTier, BillingInterval, normalizeTier } from '../../../../lib/subscription-config';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper to convert Unix timestamp to Date
const toDateOrNull = (timestamp?: number | null) =>
  typeof timestamp === 'number' ? new Date(timestamp * 1000) : null;

// Helper to get Stripe customer ID from subscription
const getStripeCustomerId = (subscription: Stripe.Subscription): string | null => {
  if (typeof subscription.customer === 'string') {
    return subscription.customer;
  }
  return subscription.customer?.id ?? null;
};

// Resolve user ID from Stripe metadata or customer ID
const resolveUserId = async (
  subscription: Stripe.Subscription,
  metadata: Stripe.Metadata | null | undefined
): Promise<string | null> => {
  // Try metadata first
  if (metadata?.userId) {
    return metadata.userId;
  }

  // Try to find user by Stripe customer ID
  const customerId = getStripeCustomerId(subscription);
  if (customerId) {
    const supabase = createClient();
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

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        // Explicitly add optional subscription field for TS compatibility across Stripe versions
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        
        if (!invoice.subscription) {
          throw new Error('No subscription ID in invoice');
        }

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
          { expand: ['items.data.price'] }
        );

        const subCast1 = subscription as unknown as Stripe.Subscription;
        const metadata = {
          ...(subCast1.metadata ?? {}),
          ...(invoice.metadata ?? {}),
        };

        const userId = await resolveUserId(subscription, metadata);
        if (!userId) {
          throw new Error('Unable to resolve user ID from subscription');
        }

        const tier = normalizeTier(metadata.tier);
        const billingInterval = (metadata.billingInterval || 'month') as BillingInterval;
        const status = subCast1.status.toUpperCase();

        const periodStart = toDateOrNull((subCast1 as any).current_period_start as number);
        const periodEnd = toDateOrNull((subCast1 as any).current_period_end as number);

        if (!periodStart || !periodEnd) {
          throw new Error('Invalid subscription period dates');
        }

        // Update subscription in database
        await SubscriptionService.updateSubscription(userId, {
          stripeSubscriptionId: subCast1.id,
          tier,
          status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        });

        // Refresh user credits
        await SubscriptionService.updateUserCredits(userId, tier, billingInterval);

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        
        if (!invoice.subscription) {
          throw new Error('No subscription ID in invoice');
        }

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        const subCast2 = subscription as any;
        const metadata = {
          ...(subCast2.metadata ?? {}),
          ...(invoice.metadata ?? {}),
        };

        const userId = await resolveUserId(subscription, metadata);
        if (!userId) {
          throw new Error('Unable to resolve user ID from subscription');
        }

        const tier = normalizeTier(metadata.tier);
        const periodStart = toDateOrNull(subCast2.current_period_start as number);
        const periodEnd = toDateOrNull(subCast2.current_period_end as number);

        if (!periodStart || !periodEnd) {
          throw new Error('Invalid subscription period dates');
        }

        // Update subscription status to past_due
        await SubscriptionService.updateSubscription(userId, {
          stripeSubscriptionId: subCast2.id,
          tier,
          status: 'PAST_DUE',
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata ?? {};

        const userId = await resolveUserId(subscription, metadata);
        if (!userId) {
          throw new Error('Unable to resolve user ID from subscription');
        }

        const tier = normalizeTier(metadata.tier);
        const billingInterval = (metadata.billingInterval || 'month') as BillingInterval;
        const status = subscription.status.toUpperCase();

        const periodStart = toDateOrNull((subscription as any).current_period_start as number);
        const periodEnd = toDateOrNull((subscription as any).current_period_end as number);

        if (!periodStart || !periodEnd) {
          throw new Error('Invalid subscription period dates');
        }

        await SubscriptionService.updateSubscription(userId, {
          stripeSubscriptionId: subscription.id,
          tier,
          status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        });

        // If subscription is active, refresh credits
        if (subscription.status === 'active') {
          await SubscriptionService.updateUserCredits(userId, tier, billingInterval);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata ?? {};

        const userId = await resolveUserId(subscription, metadata);
        if (!userId) {
          console.warn('Unable to resolve user ID for subscription deletion');
          break;
        }

        // Cancel subscription in database
        await SubscriptionService.cancelSubscription(userId);

        // Reset to free tier
        await SubscriptionService.updateUserCredits(userId, 'free', 'month');

        break;
      }

      case 'checkout.session.completed': {
        // Session completed - subscription lifecycle handled by invoice events
        console.log('Checkout session completed:', event.data.object.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error processing webhook ${event.type}:`, error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' });
}
