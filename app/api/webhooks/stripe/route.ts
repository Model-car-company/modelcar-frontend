import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import getStripe from '../../../../lib/stripe';
import { SubscriptionService } from '../../../../lib/subscription-service';
import { SubscriptionTier, BillingInterval, normalizeTier, getTierIntervalByPriceId } from '../../../../lib/subscription-config';
import { fetchSubscriptionWithPrices, tierIntervalFromPrice } from '../../../../lib/stripe-utils';
import { getAdminSupabase } from '../../../../lib/supabase/admin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

const log = (message: string, context: Record<string, any> = {}) => {
};

type ShipOrderIdentifiers = {
  payment_intent_id?: string | null;
  session_id?: string | null;
};

const upsertShipOrder = async (
  supabase: ReturnType<typeof getAdminSupabase>,
  identifiers: ShipOrderIdentifiers,
  payload: Record<string, any>
): Promise<string | null> => {
  const filters: string[] = [];
  if (identifiers.payment_intent_id) {
    filters.push(`payment_intent_id.eq.${identifiers.payment_intent_id}`);
  }
  if (identifiers.session_id) {
    filters.push(`session_id.eq.${identifiers.session_id}`);
  }

  let existingId: string | null = null;

  if (filters.length) {
    const { data } = await (supabase as any)
      .from('ship_orders')
      .select('id')
      .or(filters.join(','))
      .limit(1)
      .maybeSingle();

    existingId = (data as any)?.id ?? null;
  }

  if (existingId) {
    await (supabase as any)
      .from('ship_orders')
      .update(payload)
      .eq('id', existingId);
    return existingId;
  }

  const insertPayload = {
    ...payload,
    payment_intent_id: identifiers.payment_intent_id ?? payload.payment_intent_id ?? null,
    session_id: identifiers.session_id ?? payload.session_id ?? null,
  };

  const { data } = await (supabase as any)
    .from('ship_orders')
    .insert(insertPayload)
    .select('id')
    .maybeSingle();

  return (data as any)?.id ?? null;
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
    (interval as BillingInterval) ||
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
    const { data: profile } = (await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()) as { data: { id: string } | null; error: any };

    if (profile && (profile as any).id) {
      return (profile as any).id as string;
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
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'payment') {
          // One-time payment (shipping flow)
          const metadata = session.metadata ?? {}
          const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null
          // shipping_details exists in API but may not be in type definitions
          const shipping = (session as any).shipping_details as {
            address?: Stripe.Address | null;
            name?: string | null;
            phone?: string | null;
          } | null
          log('one-time checkout completed', {
            sessionId: session.id,
            mode: session.mode,
            amount_total: session.amount_total,
            currency: session.currency,
            metadata,
            shipping,
          })

          // Best-effort insert into ship_orders table if it exists
          try {
            await upsertShipOrder(
              supabase,
              { payment_intent_id: paymentIntentId, session_id: session.id },
              {
                user_id: metadata.userId || null,
                session_id: session.id,
                payment_intent_id: paymentIntentId,
                model_id: metadata.modelId || null,
                material_id: metadata.materialId || null,
                finish_id: metadata.finishId || null,
                quantity: metadata.quantity ? Number(metadata.quantity) : 1,
                scale: metadata.scale ? Number(metadata.scale) : null,
                total_price: session.amount_total ? session.amount_total / 100 : null,
                currency: session.currency,
                shipping_address: shipping?.address ?? null,
                shipping_name: shipping?.name ?? null,
                shipping_phone: shipping?.phone ?? null,
                status: session.payment_status || 'pending',
                raw_session: session as any,
              }
            )
          } catch (err) {
          }
        } else {
          // Subscription lifecycle handled by invoice events
          log('checkout.session.completed received', { sessionId: session.id });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const shipping = pi.shipping
        const metadata = pi.metadata ?? {}
        let orderRecordId: string | null = null

        log('payment_intent.succeeded', {
          intentId: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          metadata,
          shipping,
        })

        // Persist order if table exists
        try {
          orderRecordId = await upsertShipOrder(
            supabase,
            { payment_intent_id: pi.id },
            {
              user_id: metadata.userId || null,
              payment_intent_id: pi.id,
              model_id: metadata.modelId || null,
              material_id: metadata.materialId || null,
              finish_id: metadata.finishId || null,
              quantity: metadata.quantity ? Number(metadata.quantity) : 1,
              scale: metadata.scale ? Number(metadata.scale) : null,
              total_price: pi.amount ? pi.amount / 100 : null,
              currency: pi.currency,
              shipping_address: shipping?.address ?? null,
              shipping_name: shipping?.name ?? null,
              shipping_phone: shipping?.phone ?? null,
              status: 'paid',
              file_id: metadata.fileId || null,
              raw_session: pi as any,
            }
          )
        } catch (err) {
        }

        // Handle marketplace purchases (from gallery)
        if (metadata.assetId && metadata.creatorId) {
          try {
            // Insert into marketplace_purchases table
            const { data: purchase, error: purchaseError } = await supabase
              .from('marketplace_purchases')
              .insert({
                asset_id: metadata.assetId,
                creator_id: metadata.creatorId,
                buyer_id: metadata.userId || null,
                purchase_type: 'print',
                material_id: metadata.materialId || null,
                finish_id: metadata.finishId || null,
                quantity: metadata.quantity ? Number(metadata.quantity) : 1,
                total_price: pi.amount ? (pi.amount / 100).toFixed(2) : '0.00',
                creator_earnings: metadata.creatorCommission || '0.00',
                platform_earnings: metadata.platformEarnings || '0.00',
                payment_intent_id: pi.id,
              } as any)
              .select()
              .single()

            if (purchaseError) {
              console.error('Failed to insert marketplace purchase:', purchaseError)
            } else {
              // Get creator email to send notification
              const { data: creator } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', metadata.creatorId)
                .single() as any

              if (creator?.email) {
                // Send email notification to creator
                const { sendCreatorPurchaseNotification } = await import('../../../../lib/email')
                await sendCreatorPurchaseNotification({
                  creatorEmail: creator.email,
                })
              }
            }
          } catch (err) {
            console.error('Error handling marketplace purchase:', err)
          }
        }

        // Create order in Slant3D via Backend
        if (metadata.fileId && metadata.finishId) {
          try {
            const shippingAddress = shipping?.address
            const orderData = {
              customer_email: pi.receipt_email || 'no-email@tangibel.io',
              shipping_address: {
                name: shipping?.name || 'Valued Customer',
                line1: shippingAddress?.line1 || '',
                line2: shippingAddress?.line2 || '',
                city: shippingAddress?.city || '',
                state: shippingAddress?.state || '',
                zip: shippingAddress?.postal_code || '',
                country: shippingAddress?.country || 'US'
              },
              items: [{
                file_id: metadata.fileId,
                filament_id: metadata.finishId,
                quantity: Number(metadata.quantity || 1)
              }],
              metadata: {
                stripe_pi: pi.id,
                user_id: metadata.userId,
                model_id: metadata.modelId
              }
            }

            log('Drafting Slant3D order...', { fileId: metadata.fileId });

            const draftRes = await fetch(`${BACKEND_URL}/api/v1/printing/draft-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData)
            })

            if (!draftRes.ok) {
              const errText = await draftRes.text();
              throw new Error(`Draft failed: ${draftRes.status} ${errText}`);
            }

            const draftJson = await draftRes.json()

            if (draftJson.success && draftJson.order_id) {
              log('Processing Slant3D order...', { orderId: draftJson.order_id });

              const procRes = await fetch(`${BACKEND_URL}/api/v1/printing/process-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: draftJson.order_id })
              })

              if (!procRes.ok) {
                const errText = await procRes.text();
                throw new Error(`Process failed: ${procRes.status} ${errText}`);
              }

              log('Slant3D order processed successfully', { orderId: draftJson.order_id });

              // Update ship_orders with Slant3D order ID for tracking
              try {
                const updateQuery = (supabase as any)
                  .from('ship_orders')
                  .update({
                    slant3d_order_id: draftJson.order_id,
                    status: 'processing'
                  });

                if (orderRecordId) {
                  await updateQuery.eq('id', orderRecordId)
                } else {
                  await updateQuery.eq('payment_intent_id', pi.id)
                }

                log('Updated ship_orders with Slant3D order ID', { orderId: draftJson.order_id });
              } catch (updateErr) {
              }
            }
          } catch (err: any) {
            // We don't fail the webhook response here because the payment succeeded
            // We should probably alert admin/developer
          }
        }
        break;
      }

      default:
        // Gracefully ignore other events (e.g., invoice_payment.paid)
        log(`Unhandled event type ignored: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' });
}
