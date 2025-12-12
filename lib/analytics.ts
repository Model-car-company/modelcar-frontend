import posthog from 'posthog-js'

/**
 * Analytics utility functions for PostHog
 * All tracking is done client-side with environment variables
 */

export const analytics = {
  /**
   * Track a custom event
   * @param eventName - Name of the event to track
   * @param properties - Optional properties to include with the event
   */
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return

    try {
      posthog.capture(eventName, properties)
    } catch {
      // Analytics error - fail silently
    }
  },

  /**
   * Identify a user
   * @param userId - Unique user identifier
   * @param properties - Optional user properties
   */
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return

    try {
      posthog.identify(userId, properties)
    } catch {
      // Analytics error - fail silently
    }
  },

  /**
   * Reset user identity (on logout)
   */
  reset: () => {
    if (typeof window === 'undefined') return

    try {
      posthog.reset()
    } catch {
      // Analytics error - fail silently
    }
  },

  /**
   * Track page views (handled automatically by PostHogPageView component)
   */
  pageview: (url?: string) => {
    if (typeof window === 'undefined') return

    try {
      posthog.capture('$pageview', {
        $current_url: url || window.location.href,
      })
    } catch {
      // Analytics error - fail silently
    }
  },

  /**
   * Track revenue for LTV analysis
   * Uses PostHog's $purchase event for revenue tracking
   * @param amount - Revenue amount in dollars
   * @param currency - Currency code (default: USD)
   * @param properties - Additional properties (product type, etc)
   */
  trackRevenue: (amount: number, currency: string = 'USD', properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return

    try {
      posthog.capture('$purchase', {
        $revenue: amount,
        $currency: currency,
        ...properties
      })
    } catch {
      // Analytics error - fail silently
    }
  },

  /**
   * Track CTA button clicks with consistent naming
   * @param ctaName - Name of the CTA (e.g., 'start_designing', 'get_credits')
   * @param properties - Additional context (page, location, etc)
   */
  trackCTA: (ctaName: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return

    try {
      posthog.capture(`cta:${ctaName}`, {
        cta_name: ctaName,
        page: window.location.pathname,
        ...properties
      })
    } catch {
      // Analytics error - fail silently
    }
  },
}

// Comprehensive event names for consistent tracking
export const AnalyticsEvents = {
  // ===== AUTH EVENTS =====
  SIGN_UP_STARTED: 'auth:sign_up_started',
  SIGN_UP_COMPLETED: 'auth:sign_up_completed',
  SIGN_UP_FAILED: 'auth:sign_up_failed',
  SIGN_IN_STARTED: 'auth:sign_in_started',
  SIGN_IN_COMPLETED: 'auth:sign_in_completed',
  SIGN_IN_FAILED: 'auth:sign_in_failed',
  SIGN_OUT: 'auth:sign_out',

  // ===== PAGE VIEWS (with rich context) =====
  DASHBOARD_VIEWED: 'page:dashboard_viewed',
  GARAGE_VIEWED: 'page:garage_viewed',
  STUDIO_VIEWED: 'page:studio_viewed',
  IMAGE_PAGE_VIEWED: 'page:image_viewed',
  PRICING_VIEWED: 'page:pricing_viewed',
  PROFILE_VIEWED: 'page:profile_viewed',
  ORDERS_VIEWED: 'page:orders_viewed',
  LANDING_VIEWED: 'page:landing_viewed',

  // ===== IMAGE GENERATION =====
  IMAGE_GENERATION_STARTED: 'generation:image_started',
  IMAGE_GENERATION_COMPLETED: 'generation:image_completed',
  IMAGE_GENERATION_FAILED: 'generation:image_failed',
  IMAGE_DOWNLOADED: 'generation:image_downloaded',
  REFERENCE_IMAGE_UPLOADED: 'generation:reference_uploaded',

  // ===== 3D MODEL GENERATION =====
  MODEL_3D_GENERATION_STARTED: 'generation:3d_started',
  MODEL_3D_GENERATION_COMPLETED: 'generation:3d_completed',
  MODEL_3D_GENERATION_FAILED: 'generation:3d_failed',
  MODEL_3D_DOWNLOADED: 'generation:3d_downloaded',
  MODEL_3D_VIEWED: 'generation:3d_viewed',
  MODEL_3D_CUSTOMIZED: 'generation:3d_customized',

  // ===== GARAGE/CREATIONS =====
  DESIGN_UPLOADED: 'garage:design_uploaded',
  DESIGN_DELETED: 'garage:design_deleted',
  DESIGN_SHARED: 'garage:design_shared',
  DESIGN_MADE_PUBLIC: 'garage:design_made_public',
  DESIGN_MADE_PRIVATE: 'garage:design_made_private',

  // ===== GALLERY =====
  GALLERY_VIEWED: 'gallery:viewed',
  GALLERY_DESIGN_CLICKED: 'gallery:design_clicked',
  GALLERY_DESIGN_PREVIEWED: 'gallery:design_previewed',
  GALLERY_DESIGN_LIKED: 'gallery:design_liked',
  GALLERY_3D_PREVIEW_OPENED: 'gallery:3d_preview_opened',

  // ===== PURCHASE/REVENUE =====
  CHECKOUT_STARTED: 'purchase:checkout_started',
  CHECKOUT_COMPLETED: 'purchase:checkout_completed',
  CHECKOUT_ABANDONED: 'purchase:checkout_abandoned',
  CREDITS_PURCHASE_STARTED: 'purchase:credits_started',
  CREDITS_PURCHASED: 'purchase:credits_completed',
  DESIGN_PURCHASE_STARTED: 'purchase:design_started',
  DESIGN_PURCHASED: 'purchase:design_completed',
  SHIPPING_CHECKOUT_STARTED: 'purchase:shipping_started',
  ORDER_PLACED: 'purchase:order_placed',
  SUBSCRIPTION_STARTED: 'purchase:subscription_started',
  SUBSCRIPTION_UPGRADED: 'purchase:subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'purchase:subscription_cancelled',

  // ===== CTA CLICKS =====
  CTA_START_DESIGNING: 'cta:start_designing',
  CTA_CREATE_3D: 'cta:create_3d',
  CTA_VIEW_PRICING: 'cta:view_pricing',
  CTA_GET_CREDITS: 'cta:get_credits',
  CTA_UPGRADE: 'cta:upgrade',
  CTA_SHIP_NOW: 'cta:ship_now',
  CTA_DOWNLOAD: 'cta:download',
  CTA_PURCHASE_DESIGN: 'cta:purchase_design',
  CTA_CUSTOMIZE: 'cta:customize',
  CTA_GENERATE: 'cta:generate',
  CTA_UPLOAD_DESIGN: 'cta:upload_design',

  // ===== PROFILE/SETTINGS =====
  PROFILE_UPDATED: 'profile:updated',
  SETTINGS_CHANGED: 'profile:settings_changed',
  BILLING_PORTAL_OPENED: 'profile:billing_portal',
  AVATAR_UPDATED: 'profile:avatar_updated',

  // ===== ONBOARDING =====
  ONBOARDING_STARTED: 'onboarding:started',
  ONBOARDING_STEP_COMPLETED: 'onboarding:step_completed',
  ONBOARDING_COMPLETED: 'onboarding:completed',
  ONBOARDING_SKIPPED: 'onboarding:skipped',

  // ===== ERRORS/ISSUES =====
  ERROR_OCCURRED: 'error:occurred',
  UPLOAD_FAILED: 'error:upload_failed',
  GENERATION_FAILED: 'error:generation_failed',
} as const

// Type for event names
export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents]
