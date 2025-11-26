import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import getStripe from '../../../lib/stripe';
import { SUBSCRIPTION_TIERS, SubscriptionTier, BillingInterval, getPriceId } from '../../../lib/subscription-config';
import { SubscriptionService } from '../../../lib/subscription-service';

export async function POST(req: NextRequest) {
  try {
    const { tier, billingInterval = 'month' } = await req.json() as {
      tier: SubscriptionTier;
      billingInterval?: BillingInterval;
    };

    // Validate tier
    if (!SUBSCRIPTION_TIERS[tier] || tier === 'free') {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check for existing active subscription
    const activeStatuses = ['active', 'trialing'];
    if (profile.subscription_status && activeStatuses.includes(profile.subscription_status.toLowerCase())) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 409 }
      );
    }

    // Get tier configuration
    const priceId = getPriceId(tier, billingInterval);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this tier' },
        { status: 500 }
      );
    }

    // Create or get Stripe customer
    const customerId = await SubscriptionService.createOrGetCustomer(
      supabase,
      user.id,
      user.email || profile.email
    );

    // Create checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: user.id,
        tier,
        billingInterval,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier,
          billingInterval,
        },
        trial_period_days: undefined, // explicit to avoid null vs undefined issues
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Checkout API endpoint' });
}
