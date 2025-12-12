'use client'

import { useEffect, useRef } from 'react'
import posthog from 'posthog-js'

interface PostHogIdentifyProps {
    userId: string
    email?: string | null
    name?: string | null
    createdAt?: string | null
}

/**
 * Component that identifies users in PostHog when they're logged in.
 * Place this in authenticated layouts/pages to ensure users are tracked
 * with their actual email and name instead of anonymous IDs.
 */
export function PostHogIdentify({ userId, email, name, createdAt }: PostHogIdentifyProps) {
    const hasIdentified = useRef(false)

    useEffect(() => {
        // Only identify once per mount to avoid duplicate calls
        if (hasIdentified.current || !userId) return

        // Check if PostHog is loaded
        if (!posthog.__loaded) return

        try {
            // Build person properties
            const personProperties: Record<string, any> = {}

            if (email) {
                personProperties.email = email
                personProperties.$email = email // PostHog standard property
            }
            if (name) {
                personProperties.name = name
                personProperties.$name = name // PostHog standard property
            }
            if (createdAt) {
                personProperties.created_at = createdAt
            }

            // Identify the user in PostHog
            posthog.identify(userId, personProperties)

            hasIdentified.current = true
        } catch {
            // Analytics error - fail silently in production
        }
    }, [userId, email, name, createdAt])

    return null
}

/**
 * Reset PostHog identity on sign-out.
 * Call this before redirecting to sign-out.
 */
export function resetPostHogIdentity() {
    if (typeof window === 'undefined') return

    try {
        posthog.reset()
    } catch {
        // Analytics error - fail silently in production
    }
}
