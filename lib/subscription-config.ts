export type SubscriptionTier = 'free' | 'garage' | 'showroom' | 'dealership';
export type BillingInterval = 'month' | 'year';

export interface TierConfig {
  name: string;
  credits: number;
  stripePriceId: string | null;
  features: string[];
  yearly?: {
    credits: number;
    stripePriceId: string | null;
  };
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: 'Free',
    credits: 10,
    stripePriceId: null,
    features: [
      '10 credits to start',
      'Basic 3D viewer',
      'Community support',
    ],
  },
  garage: {
    name: 'Garage Parking',
    credits: 50,
    stripePriceId: process.env.STRIPE_GARAGE_MONTHLY_PRICE_ID || null,
    features: [
      '50 AI generations/month',
      '10 GB cloud storage',
      'STL, OBJ, GLB exports',
      'Basic 3D viewer',
      'Community support',
    ],
    yearly: {
      credits: 600,
      stripePriceId: process.env.STRIPE_GARAGE_YEARLY_PRICE_ID || null,
    },
  },
  showroom: {
    name: 'Showroom Floor',
    credits: 200,
    stripePriceId: process.env.STRIPE_SHOWROOM_MONTHLY_PRICE_ID || null,
    features: [
      '200 AI generations/month',
      '100 GB cloud storage',
      'All export formats',
      'Advanced 3D editing',
      'Priority support',
      'No watermarks',
      'Commercial license',
    ],
    yearly: {
      credits: 2400,
      stripePriceId: process.env.STRIPE_SHOWROOM_YEARLY_PRICE_ID || null,
    },
  },
  dealership: {
    name: 'Dealership',
    credits: 500,
    stripePriceId: process.env.STRIPE_DEALERSHIP_MONTHLY_PRICE_ID || null,
    features: [
      'Unlimited AI generations',
      '1 TB cloud storage',
      'API access',
      'Team collaboration (5 seats)',
      'White-label exports',
      'Premium support',
      'Custom branding',
    ],
    yearly: {
      credits: 6000,
      stripePriceId: process.env.STRIPE_DEALERSHIP_YEARLY_PRICE_ID || null,
    },
  },
} as const;

// Helper to get tier config
export const getTierConfig = (tier: SubscriptionTier): TierConfig => {
  return SUBSCRIPTION_TIERS[tier];
};

// Helper to normalize tier string
export const normalizeTier = (tier?: string | null): SubscriptionTier => {
  const lower = (tier ?? 'free').toLowerCase() as SubscriptionTier;
  return SUBSCRIPTION_TIERS[lower] ? lower : 'free';
};
