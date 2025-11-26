import { SupabaseClient } from '@supabase/supabase-js';
import getStripe from './stripe';
import { SUBSCRIPTION_TIERS, SubscriptionTier, BillingInterval, normalizeTier } from './subscription-config';

export class SubscriptionService {
  /**
   * Create or retrieve Stripe customer for user
   */
  static async createOrGetCustomer(
    supabase: SupabaseClient,
    userId: string,
    email: string
  ): Promise<string> {
    const stripe = getStripe();
    
    // Check if user already has a customer ID
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
    if (profileErr) {
      throw new Error(`Failed to load profile for customer create: ${profileErr.message}`);
    }
    
    if (profile?.stripe_customer_id) {
      // Verify customer exists in Stripe
      try {
        await stripe.customers.retrieve(profile.stripe_customer_id);
        return profile.stripe_customer_id;
      } catch (error) {
        // Customer doesn't exist, create new one
        console.log('Stripe customer not found, creating new one');
      }
    }
    
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    
    // Save customer ID to profile
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);
    if (updateErr) {
      throw new Error(`Failed to persist stripe_customer_id: ${updateErr.message}`);
    }
    
    return customer.id;
  }

  /**
   * Update user credits based on subscription tier
   */
  static async updateUserCredits(
    supabase: SupabaseClient,
    userId: string,
    tier: SubscriptionTier,
    billingInterval: BillingInterval
  ): Promise<void> {
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    const credits = billingInterval === 'year' 
      ? tierConfig.yearly?.credits ?? tierConfig.credits
      : tierConfig.credits;
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        credits_remaining: credits,
        subscription_tier: tier,
        subscription_billing_interval: billingInterval,
      })
      .eq('id', userId);
    if (error) {
      throw new Error(`Failed to update credits: ${error.message}`);
    }
  }

  /**
   * Update subscription details in Supabase
   */
  static async updateSubscription(
    supabase: SupabaseClient,
    userId: string,
    subscriptionData: {
      stripeSubscriptionId: string;
      tier: SubscriptionTier;
      status: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      billingInterval?: BillingInterval;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        stripe_subscription_id: subscriptionData.stripeSubscriptionId,
        subscription_tier: subscriptionData.tier,
        subscription_status: subscriptionData.status.toLowerCase(),
        current_period_start: subscriptionData.currentPeriodStart.toISOString(),
        current_period_end: subscriptionData.currentPeriodEnd.toISOString(),
        subscription_billing_interval: subscriptionData.billingInterval ?? null,
      })
      .eq('id', userId);
    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  /**
   * Optionally mirror subscription state into auxiliary tables if they exist.
   * Safely no-ops when tables are absent to keep backward compatibility.
   */
  static async recordSubscriptionSnapshot(
    supabase: SupabaseClient,
    snapshot: {
      userId: string;
      stripeSubscriptionId: string;
      tier: SubscriptionTier;
      status: string;
      billingInterval: BillingInterval;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      event: string;
      rawPayload?: any;
    }
  ) {
    // Tables have been removed; keep silent no-op for compatibility.
    return;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(supabase: SupabaseClient, userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        subscription_tier: 'free',
        subscription_billing_interval: 'month',
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
      })
      .eq('id', userId);
    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(supabase: SupabaseClient, userId: string): Promise<boolean> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single();
    
    const activeStatuses = ['active', 'trialing'];
    return profile?.subscription_status 
      ? activeStatuses.includes(profile.subscription_status.toLowerCase())
      : false;
  }

  /**
   * Get user subscription details
   */
  static async getSubscriptionDetails(supabase: SupabaseClient, userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, current_period_end, credits_remaining')
      .eq('id', userId)
      .single();
    
    return profile;
  }
}
