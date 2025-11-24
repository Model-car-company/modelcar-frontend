import { createClient } from './supabase/client';
import getStripe from './stripe';
import { SUBSCRIPTION_TIERS, SubscriptionTier, BillingInterval, normalizeTier } from './subscription-config';

export class SubscriptionService {
  /**
   * Create or retrieve Stripe customer for user
   */
  static async createOrGetCustomer(userId: string, email: string): Promise<string> {
    const supabase = createClient();
    const stripe = getStripe();
    
    // Check if user already has a customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
    
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
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);
    
    return customer.id;
  }

  /**
   * Update user credits based on subscription tier
   */
  static async updateUserCredits(
    userId: string,
    tier: SubscriptionTier,
    billingInterval: BillingInterval
  ): Promise<void> {
    const supabase = createClient();
    
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    const credits = billingInterval === 'year' 
      ? tierConfig.yearly?.credits ?? tierConfig.credits
      : tierConfig.credits;
    
    await supabase
      .from('profiles')
      .update({ 
        credits_remaining: credits,
        subscription_tier: tier 
      })
      .eq('id', userId);
  }

  /**
   * Update subscription details in Supabase
   */
  static async updateSubscription(
    userId: string,
    subscriptionData: {
      stripeSubscriptionId: string;
      tier: SubscriptionTier;
      status: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
    }
  ): Promise<void> {
    const supabase = createClient();
    
    await supabase
      .from('profiles')
      .update({
        stripe_subscription_id: subscriptionData.stripeSubscriptionId,
        subscription_tier: subscriptionData.tier,
        subscription_status: subscriptionData.status.toLowerCase(),
        current_period_start: subscriptionData.currentPeriodStart.toISOString(),
        current_period_end: subscriptionData.currentPeriodEnd.toISOString(),
      })
      .eq('id', userId);
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string): Promise<void> {
    const supabase = createClient();
    
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        stripe_subscription_id: null,
      })
      .eq('id', userId);
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const supabase = createClient();
    
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
  static async getSubscriptionDetails(userId: string) {
    const supabase = createClient();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, current_period_end, credits_remaining')
      .eq('id', userId)
      .single();
    
    return profile;
  }
}
