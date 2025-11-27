'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { SubscriptionTier, BillingInterval } from '../lib/subscription-config'

interface SubscribeButtonProps {
  tier: SubscriptionTier
  billingInterval: BillingInterval
  label: string
  popular?: boolean
  className?: string
  disabled?: boolean
  blocked?: boolean
  onBlocked?: () => void
}

// Initialize Stripe with public key (safe for client-side)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscribeButton({
  tier,
  billingInterval,
  label,
  popular = false,
  className,
  disabled = false,
  blocked = false,
  onBlocked,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    if (disabled) return
    if (blocked) {
      onBlocked?.()
      return
    }
    if (tier === 'free') {
      router.push('/sign-up')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Redirecting to checkout...')

    try {
      // Call API to create checkout session
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          billingInterval,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      window.location.href = data.url;


    } catch (error: any) {
      toast.dismiss(loadingToast)

      if (error.message === 'Unauthorized') {
        toast.error('Please sign in to subscribe')
        router.push('/sign-in?redirect=/pricing')
      } else if (error.message.includes('already has an active subscription')) {
        toast.error('You already have an active subscription')
        router.push('/profile')
      } else {
        toast.error(error.message || 'Failed to start checkout')
      }
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || disabled}
      className={className || `w-full py-3 rounded border text-sm font-light tracking-[0.1em] transition-all ${blocked
          ? 'border-green-400/50 text-green-300 bg-green-500/5'
          : popular
            ? 'bg-white text-black border-white hover:bg-white/90'
            : 'border-white/10 hover:border-white/30 hover:bg-white/5'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Loading...' : label}
    </button>
  )
}
