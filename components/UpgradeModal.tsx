'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '../lib/subscription-config'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  creditsRemaining: number
  requiredCredits?: number
  requiredTier?: SubscriptionTier
  billingInterval?: 'month' | 'year'
  hasActivePaidPlan?: boolean
}

export default function UpgradeModal({
  isOpen,
  onClose,
  creditsRemaining,
  requiredCredits = 1,
  requiredTier = 'garage',
  billingInterval = 'month',
  hasActivePaidPlan = false,
}: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  const tierCfg = SUBSCRIPTION_TIERS[requiredTier]
  const priceLabel =
    billingInterval === 'year'
      ? `$${Math.round((tierCfg.monthlyPrice ?? 0) * 12 * 0.8)}/yr`
      : `$${tierCfg.monthlyPrice ?? 0}/mo`

  const handlePrimary = async () => {
    try {
      setLoading(true)
      if (hasActivePaidPlan) {
        const resp = await fetch('/api/create-portal-session', { method: 'POST' })
        const data = await resp.json()
        if (data.url) {
          window.location.href = data.url
          return
        }
      } else {
        const resp = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: requiredTier, billingInterval }),
        })
        const data = await resp.json()
        if (resp.ok && data.url) {
          window.location.href = data.url
          return
        }
      }
      router.push('/pricing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-black border border-white/10 w-full max-w-4xl relative overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 bg-white/5 border-r border-white/10 relative min-h-[300px] md:min-h-[500px]">
                  <Image
                    src="/popup/Gemini_Generated_Image_jhy12ijhy12ijhy1.png"
                    alt="Upgrade"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-thin tracking-tight mb-2">
                    {hasActivePaidPlan ? 'Manage your plan' : `Upgrade to ${tierCfg.name}`}
                  </h2>
                  <p className="text-sm text-gray-400 font-light mb-6">
                    Keep generating images without interruptions.
                  </p>

                  <div className="mb-6">
                    <p className="text-5xl font-thin text-white mb-2">{priceLabel}</p>
                    <p className="text-sm font-light text-gray-500">
                      {billingInterval === 'year' ? 'Billed annually (save 20%)' : 'Billed monthly'}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-light text-gray-300">Unlimited AI image generations</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-light text-gray-300">High-quality 3D model conversions</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-light text-gray-300">Priority processing queue</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-light text-gray-300">Access to exclusive models</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-light text-gray-300">Premium support & tutorials</p>
                    </div>
                  </div>

                  <button
                    onClick={handlePrimary}
                    disabled={loading}
                    className="block w-full bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-500/20 border border-red-500/30 text-white py-4 text-center font-light tracking-wide hover:from-red-500/30 hover:via-red-600/20 hover:to-red-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {hasActivePaidPlan ? 'Open Billing Portal' : loading ? 'Redirecting...' : 'Upgrade Now'}
                  </button>

                  <p className="text-xs font-light text-gray-600 mt-6 text-center">
                    You have {creditsRemaining} credits • Need {requiredCredits} to continue
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
