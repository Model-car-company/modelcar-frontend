import Stripe from 'stripe'
import getStripe from './stripe'

/**
 * Retrieve a subscription expanded with items/prices, and merge invoice metadata.
 */
export async function fetchSubscriptionWithPrices(subscriptionId: string) {
  const stripe = getStripe()
  return stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price.product'] })
}

export interface PeriodRange {
  start: Date | null
  end: Date | null
}

/**
 * Convert Stripe timestamps (may be number|string|undefined) to Date objects with fallbacks.
 */
export function derivePeriodRange(
  subscription: Partial<Stripe.Subscription> | null | undefined,
  invoice?: Partial<Stripe.Invoice> | null
): PeriodRange {
  const toDate = (v?: number | string | null) => {
    const n = typeof v === 'string' ? Number(v) : v
    return typeof n === 'number' && !Number.isNaN(n) ? new Date(n * 1000) : null
  }

  const startSeconds =
    (subscription as any)?.current_period_start ??
    invoice?.lines?.data?.[0]?.period?.start ??
    invoice?.period_start

  const endSeconds =
    (subscription as any)?.current_period_end ??
    invoice?.lines?.data?.[0]?.period?.end ??
    invoice?.period_end

  return { start: toDate(startSeconds), end: toDate(endSeconds) }
}

/**
 * Given a Stripe price object (optionally expanded product), derive tier + interval using:
 * 1) price.recurring.interval -> BillingInterval
 * 2) product.metadata.tier_key or product.name to infer tier slug
 */
export function tierIntervalFromPrice(
  price?: Stripe.Price | null
): { interval: 'month' | 'year' | null; tierKey: string | null; priceId: string | null } {
  if (!price) return { interval: null, tierKey: null, priceId: null }
  const interval = (price.recurring?.interval as 'month' | 'year' | undefined) ?? null
  const product: any = (price as any).product
  const tierKey =
    product?.metadata?.tier_key?.toString().toLowerCase?.() ??
    product?.name?.toString().toLowerCase?.() ??
    null
  return { interval, tierKey, priceId: price.id }
}
