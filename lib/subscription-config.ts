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
    credits: 6,
    stripePriceId: null,
    features: [
      '6 credits to start',
      'Basic 3D viewer',
      'Community support',
    ],
  },
  garage: {
    name: 'Garage Parking',
    description: 'For hobbyists and individual creators getting started',
    monthlyPrice: 9,
    yearlyDiscountPercent: 20,
    credits: 100,
    stripePriceId: process.env.STRIPE_GARAGE_MONTHLY_PRICE_ID || null,
    features: [
      '100 credits/month',
      '33 AI images OR 50 3D models',
      'OR 20 full workflows (image → 3D)',
      '10 GB cloud storage',
      'STL, OBJ, GLB exports',
      'Basic 3D viewer',
      'Community support',
    ],
    yearly: {
      credits: 1200,
      stripePriceId: process.env.STRIPE_GARAGE_YEARLY_PRICE_ID || null,
    },
  },
  showroom: {
    name: 'Showroom Floor',
    description: 'For serious creators and small studios',
    monthlyPrice: 29,
    yearlyDiscountPercent: 20,
    credits: 350,
    stripePriceId: process.env.STRIPE_SHOWROOM_MONTHLY_PRICE_ID || null,
    features: [
      '350 credits/month',
      '116 AI images OR 175 3D models',
      'OR 70 full workflows (image → 3D)',
      '100 GB cloud storage',
      'All export formats',
      'Priority support',
      'No watermarks',
      'Commercial license',
    ],
    yearly: {
      credits: 4200,
      stripePriceId: process.env.STRIPE_SHOWROOM_YEARLY_PRICE_ID || null,
    },
  },
  dealership: {
    name: 'Dealership',
    description: 'For teams and agencies scaling production',
    monthlyPrice: 49,
    yearlyDiscountPercent: 20,
    credits: 650,
    stripePriceId: process.env.STRIPE_DEALERSHIP_MONTHLY_PRICE_ID || null,
    features: [
      '650 credits/month',
      '216 AI images OR 325 3D models',
      'OR 130 full workflows (image → 3D)',
      '1 TB cloud storage',
      'API access',
      'Team collaboration (5 seats)',
      'White-label exports',
      'Premium support',
    ],
    yearly: {
      credits: 7800,
      stripePriceId: process.env.STRIPE_DEALERSHIP_YEARLY_PRICE_ID || null,
    },
  },
  factory: {
    name: 'Factory Owner',
    description: 'Enterprise-grade AI for high-volume production',
    monthlyPrice: 199,
    yearlyDiscountPercent: 20,
    credits: 3000,
    stripePriceId: process.env.STRIPE_FACTORY_MONTHLY_PRICE_ID || null,
    features: [
      '3,000 credits/month',
      '1,000 AI images OR 1,500 3D models',
      'OR 600 full workflows (image → 3D)',
      'All Dealership benefits',
      'Unlimited team seats',
      'Custom AI model training',
      'Dedicated account manager',
      'SLA guarantee (99.9%)',
    ],
    yearly: {
      credits: 36000,
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
