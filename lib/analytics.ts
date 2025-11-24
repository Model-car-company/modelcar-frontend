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
    } catch (error) {
      console.error('Analytics tracking error:', error)
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
    } catch (error) {
      console.error('Analytics identify error:', error)
    }
  },

  /**
   * Reset user identity (on logout)
   */
  reset: () => {
    if (typeof window === 'undefined') return
    
    try {
      posthog.reset()
    } catch (error) {
      console.error('Analytics reset error:', error)
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
    } catch (error) {
      console.error('Analytics pageview error:', error)
    }
  },
}

// Common event names for consistency
export const AnalyticsEvents = {
  // Auth events
  SIGN_UP: 'user_signed_up',
  SIGN_IN: 'user_signed_in',
  SIGN_OUT: 'user_signed_out',
  
  // Image generation events
  IMAGE_GENERATION_STARTED: 'image_generation_started',
  IMAGE_GENERATION_COMPLETED: 'image_generation_completed',
  IMAGE_GENERATION_FAILED: 'image_generation_failed',
  IMAGE_DOWNLOADED: 'image_downloaded',
  REFERENCE_IMAGE_UPLOADED: 'reference_image_uploaded',
  
  // 3D model events
  MODEL_3D_GENERATION_STARTED: '3d_model_generation_started',
  MODEL_3D_GENERATION_COMPLETED: '3d_model_generation_completed',
  MODEL_3D_GENERATION_FAILED: '3d_model_generation_failed',
  MODEL_3D_DOWNLOADED: '3d_model_downloaded',
  MODEL_3D_VIEWED: '3d_model_viewed',
  
  // Garage events
  GARAGE_VIEWED: 'garage_viewed',
  MODEL_DELETED: 'model_deleted',
  
  // Credit events
  CREDITS_PURCHASED: 'credits_purchased',
  CREDITS_LOW_WARNING: 'credits_low_warning',
  
  // Navigation events
  PAGE_VIEWED: 'page_viewed',
  CTA_CLICKED: 'cta_clicked',
  
  // Profile events
  PROFILE_UPDATED: 'profile_updated',
} as const
