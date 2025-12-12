'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({
  children,
  apiKey,
  apiHost
}: {
  children: React.ReactNode
  apiKey?: string
  apiHost?: string
}) {
  useEffect(() => {
    // Only initialize PostHog if we have the required environment variables
    // Prefer props (runtime), fallback to env (build time)
    const posthogKey = apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = apiHost || process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!posthogKey) {
      console.warn('[PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY - analytics disabled')
      return
    }

    // Don't re-initialize if already done
    if (posthog.__loaded) {
      return
    }

    // Initialize PostHog with FULL features enabled
    // Using reverse proxy via Next.js rewrites for ad-blocker bypass
    posthog.init(posthogKey, {
      api_host: '/ingest', // Route through our domain to bypass ad blockers
      ui_host: 'https://us.posthog.com', // Required for toolbar to work

      // User identification
      person_profiles: 'always', // Track all users, not just identified

      // Page tracking
      capture_pageview: false, // We manually capture via PostHogPageView
      capture_pageleave: true,

      // Session Replay - FULL recording
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: false, // Set to true if you want to mask sensitive inputs
        maskTextSelector: '[data-mask]', // Mask elements with this attribute
        recordCrossOriginIframes: false,
      },

      // Autocapture - clicks, form submissions, etc.
      autocapture: true,

      // Heatmaps
      enable_heatmaps: true,

      // Performance & scroll tracking
      capture_performance: true,
      enable_recording_console_log: true,

      // Persistence
      persistence: 'localStorage+cookie',

      // Debug in development
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug()
        }
      }
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// Hook to track page views in App Router
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + '?' + searchParams.toString()
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}
