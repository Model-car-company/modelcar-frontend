export type SubscriptionTier = 'free' | 'garage' | 'showroom' | 'dealership' | 'factory';
export type BillingInterval = 'month' | 'year';

export interface TierConfig {
  name: string;
  description?: string;
  monthlyPrice?: number; // display-only, not used for billing logic
  yearlyDiscountPercent?: number; // display-only
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
    description: 'Starter credits to explore AI image and 3D tools',
    monthlyPrice: 0,
    yearlyDiscountPercent: 0,
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
    description: 'CPU-based generations for hobbyists and individual creators',
    monthlyPrice: 9,
    yearlyDiscountPercent: 20,
    credits: 50,
    stripePriceId: process.env.STRIPE_GARAGE_MONTHLY_PRICE_ID || null,
    features: [
      '50 AI generations/month',
      '10 GB cloud storage',
      'STL, OBJ, GLB exports',
      'Basic 3D viewer',
      'Community support',
      'Watermark on exports',
    ],
    yearly: {
      credits: 600,
      stripePriceId: process.env.STRIPE_GARAGE_YEARLY_PRICE_ID || null,
    },
  },
  showroom: {
    name: 'Showroom Floor',
    description: 'GPU-based generations for serious creators and small studios',
    monthlyPrice: 29,
    yearlyDiscountPercent: 20,
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
      'Texture customization',
    ],
    yearly: {
      credits: 2400,
      stripePriceId: process.env.STRIPE_SHOWROOM_YEARLY_PRICE_ID || null,
    },
  },
  dealership: {
    name: 'Dealership',
    description: 'Enterprise-grade GPU generations for teams and agencies',
    monthlyPrice: 49,
    yearlyDiscountPercent: 20,
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
      'Batch processing',
      'Version control',
      'Analytics dashboard',
    ],
    yearly: {
      credits: 6000,
      stripePriceId: process.env.STRIPE_DEALERSHIP_YEARLY_PRICE_ID || null,
    },
  },
  factory: {
    name: 'Factory Owner',
    description: 'Enterprise-grade AI with custom models, dedicated infra, and SLAs',
    monthlyPrice: 199,
    yearlyDiscountPercent: 20,
    credits: 2000,
    stripePriceId: process.env.STRIPE_FACTORY_MONTHLY_PRICE_ID || null,
    features: [
      'All Dealership benefits',
      'Custom AI model training',
      'Dedicated infrastructure',
      'Unlimited team seats',
      'SSO & advanced security',
      'SLA guarantee (99.9%)',
      'On-premise option',
      'Dedicated account manager',
      'Custom integrations',
      'Priority feature requests',
    ],
    yearly: {
      credits: 24000,
      stripePriceId: process.env.STRIPE_FACTORY_YEARLY_PRICE_ID || null,
    },
  },
} as const;

// Helper to get tier config
export const getTierConfig = (tier: SubscriptionTier): TierConfig => {
  return SUBSCRIPTION_TIERS[tier];
};

// Helper to normalize tier string
// Normalize tier strings coming from metadata / legacy records
const LEGACY_TIER_MAP: Record<string, SubscriptionTier> = {
  pro: 'showroom',
  enterprise: 'factory',
};

export const normalizeTier = (tier?: string | null): SubscriptionTier => {
  const lower = (tier ?? 'free').toLowerCase();
  if (LEGACY_TIER_MAP[lower]) return LEGACY_TIER_MAP[lower];
  return (SUBSCRIPTION_TIERS as any)[lower] ? (lower as SubscriptionTier) : 'free';
};

export const getPriceId = (tier: SubscriptionTier, billingInterval: BillingInterval) => {
  const cfg = SUBSCRIPTION_TIERS[tier]
  if (!cfg) return null
  return billingInterval === 'year'
    ? cfg.yearly?.stripePriceId ?? null
    : cfg.stripePriceId
}

export const getTierIntervalByPriceId = (
  priceId?: string | null
): { tier: SubscriptionTier; interval: BillingInterval } | null => {
  if (!priceId) return null
  const normalized = priceId.trim()
  const match = Object.entries(SUBSCRIPTION_TIERS).find(([tierKey, cfg]) => {
    return (
      cfg.stripePriceId === normalized ||
      cfg.yearly?.stripePriceId === normalized
    )
  })
  if (!match) return null
  const [tierKey, cfg] = match as [SubscriptionTier, TierConfig]
  const interval =
    cfg.yearly?.stripePriceId === normalized ? 'year' : 'month'
  return { tier: tierKey, interval }
}

// Frontend pricing plans (single source of truth for UI + backend IDs)
export type PricingPlanTier = SubscriptionTier;

export interface PricingPlan {
  tier: PricingPlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyDiscountPercent: number;
  popular?: boolean;
  isEnterprise?: boolean;
  cta?: string;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'garage',
    name: SUBSCRIPTION_TIERS.garage.name,
    description: SUBSCRIPTION_TIERS.garage.description ?? '',
    monthlyPrice: SUBSCRIPTION_TIERS.garage.monthlyPrice ?? 9,
    yearlyDiscountPercent: SUBSCRIPTION_TIERS.garage.yearlyDiscountPercent ?? 20,
    popular: false,
    cta: 'Start Creating',
    features: SUBSCRIPTION_TIERS.garage.features,
  },
  {
    tier: 'showroom',
    name: SUBSCRIPTION_TIERS.showroom.name,
    description: SUBSCRIPTION_TIERS.showroom.description ?? '',
    monthlyPrice: SUBSCRIPTION_TIERS.showroom.monthlyPrice ?? 29,
    yearlyDiscountPercent: SUBSCRIPTION_TIERS.showroom.yearlyDiscountPercent ?? 20,
    popular: true,
    cta: 'Go Pro',
    features: SUBSCRIPTION_TIERS.showroom.features,
  },
  {
    tier: 'dealership',
    name: SUBSCRIPTION_TIERS.dealership.name,
    description: SUBSCRIPTION_TIERS.dealership.description ?? '',
    monthlyPrice: SUBSCRIPTION_TIERS.dealership.monthlyPrice ?? 49,
    yearlyDiscountPercent: SUBSCRIPTION_TIERS.dealership.yearlyDiscountPercent ?? 20,
    popular: false,
    cta: 'Scale Up',
    features: SUBSCRIPTION_TIERS.dealership.features,
  },
  {
    tier: 'factory',
    name: SUBSCRIPTION_TIERS.factory.name,
    description: SUBSCRIPTION_TIERS.factory.description ?? '',
    monthlyPrice: SUBSCRIPTION_TIERS.factory.monthlyPrice ?? 199,
    yearlyDiscountPercent: SUBSCRIPTION_TIERS.factory.yearlyDiscountPercent ?? 20,
    popular: false,
    cta: 'Own the Lot',
    features: SUBSCRIPTION_TIERS.factory.features,
  },
];
