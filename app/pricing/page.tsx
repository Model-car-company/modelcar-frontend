'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Building2, Factory } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import SubscribeButton from '../../components/SubscribeButton'
import { Toaster } from 'react-hot-toast'
import { PRICING_PLANS, SubscriptionTier } from '../../lib/subscription-config'
import { createClient } from '../../lib/supabase/client'
import { analytics, AnalyticsEvents } from '../../lib/analytics'

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [showManageModal, setShowManageModal] = useState(false)

  const iconByTier: Record<string, typeof Zap> = {
    garage: Zap,
    showroom: Building2,
    dealership: Building2,
    factory: Factory,
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setProfile(null)
          return
        }
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, stripe_subscription_id, subscription_billing_interval')
          .eq('id', user.id)
          .single()
        setProfile(data || null)

        // Track pricing page view with context
        analytics.track(AnalyticsEvents.PRICING_VIEWED, {
          has_active_subscription: data?.subscription_status ? ['active', 'trialing', 'past_due'].includes(data.subscription_status.toLowerCase()) : false,
          current_tier: data?.subscription_tier || 'none'
        })
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
  }, [supabase])

  const activeStatuses = useMemo(() => ['active', 'trialing', 'past_due'], [])
  const currentTier = profile?.subscription_tier as SubscriptionTier | undefined
  const currentInterval = (profile?.subscription_billing_interval || 'month').toLowerCase()
  const isActive = profile?.subscription_status
    ? activeStatuses.includes(profile.subscription_status.toLowerCase())
    : false
  const billingInterval = profile?.subscription_billing_interval || 'month'

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Toaster position="top-right" />
      {/* Sophisticated Gradient Background */}
      <div className="fixed inset-0 z-0">
        {/* Main gradient orb - top right */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-gray-200/20 via-gray-400/10 to-transparent blur-3xl" />

        {/* Secondary gradient orb - center left */}
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-radial from-white/15 via-gray-300/8 to-transparent blur-3xl" />

        {/* Tertiary gradient orb - bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-radial from-gray-100/10 via-gray-500/5 to-transparent blur-3xl" />

        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-7xl mx-auto px-8 md:px-16 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-xl font-thin tracking-[0.2em]">
                TANGIBEL
              </Link>
              <Link
                href="/dashboard"
                className="text-[11px] font-extralight tracking-[0.2em] hover:opacity-60 transition-opacity uppercase"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-6">
                Pricing Plans
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-thin tracking-tight mb-8">
                CHOOSE YOUR WORKSPACE
              </h1>
              <p className="text-sm font-extralight tracking-[0.2em] text-gray-400 max-w-2xl mx-auto">
                From individual creators to enterprise studios, find the perfect plan to bring your 3D visions to life
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-12"
            >
              <span className={`text-sm font-extralight tracking-wide ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-16 h-8 bg-white/10 rounded-full border border-white/10 transition-all hover:bg-white/15"
              >
                <motion.div
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
                  animate={{ x: isYearly ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-extralight tracking-wide ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                Yearly
              </span>
              {isYearly && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-light text-green-400 tracking-wide"
                >
                  Save 20%
                </motion.span>
              )}
            </motion.div>
          </div>
        </section>

        {/* Pricing Grid */}
        <section className="pb-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRICING_PLANS.map((tier, index) => {
                const isCurrent =
                  isActive &&
                  currentTier === tier.tier &&
                  ((isYearly && currentInterval === 'year') || (!isYearly && currentInterval === 'month'))
                const blocked = isActive
                return (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative backdrop-blur-sm rounded-lg p-8 transition-all duration-300 ${isCurrent
                        ? 'border border-green-400/60 bg-white/[0.06] shadow-[0_0_30px_rgba(74,222,128,0.25)]'
                        : tier.popular
                          ? 'border border-white/20 bg-white/[0.02] lg:-mt-6 lg:mb-[-24px]'
                          : 'border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                  >
                    {/* Popular / Current Badge */}
                    {isCurrent ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="px-4 py-1.5 bg-green-400/90 backdrop-blur-sm text-black text-[10px] font-medium tracking-[0.15em] uppercase rounded-sm shadow-lg shadow-green-400/20">
                          Current Plan
                        </div>
                      </div>
                    ) : tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-black text-[10px] font-medium tracking-[0.15em] uppercase rounded-sm shadow-lg shadow-white/10">
                          Most Popular
                        </div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="mb-6">
                      {(() => {
                        const Icon = iconByTier[tier.tier] || Sparkles
                        return <Icon className="w-8 h-8 text-white/40" strokeWidth={1} />
                      })()}
                    </div>

                    {/* Tier Name */}
                    <h3 className="text-xl font-thin tracking-[0.1em] mb-2">
                      {tier.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs font-extralight text-gray-500 mb-6 leading-relaxed">
                      {tier.description}
                    </p>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-thin tracking-tight">
                          ${isYearly
                            ? Math.floor(tier.monthlyPrice * 12 * (1 - tier.yearlyDiscountPercent / 100))
                            : tier.monthlyPrice}
                        </span>
                        <span className="text-sm font-extralight text-gray-500 tracking-wider">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      </div>
                      {isYearly && (
                        <p className="text-xs font-extralight text-gray-500 mt-2">
                          ${tier.monthlyPrice}/month billed annually
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="mb-8">
                      <SubscribeButton
                        tier={tier.tier as SubscriptionTier}
                        billingInterval={isYearly ? 'year' : 'month'}
                        label={
                          isCurrent
                            ? 'Current Plan'
                            : blocked
                              ? 'Manage in Billing'
                              : tier.cta || 'Subscribe'
                        }
                        popular={tier.popular}
                        blocked={blocked}
                        disabled={profileLoading}
                        onBlocked={() => setShowManageModal(true)}
                      />
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {tier.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                          <span className="text-xs font-extralight text-gray-400 leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Manage Billing Modal */}
        {showManageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowManageModal(false)}
            />
            <div className="relative max-w-lg w-full bg-white/[0.04] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-light tracking-tight mb-3">Manage Your Plan</h3>
              <p className="text-sm text-gray-300 font-extralight leading-6 mb-6">
                You already have an active subscription. To upgrade or downgrade, go to your profile, open the
                <span className="font-medium text-white"> Subscription & Billing </span> tab, and open the Stripe billing portal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/profile"
                  className="flex-1 text-center px-4 py-3 rounded bg-white text-black text-sm tracking-[0.1em] hover:bg-white/90 transition"
                >
                  Go to Profile
                </Link>
                <button
                  onClick={() => setShowManageModal(false)}
                  className="flex-1 px-4 py-3 rounded border border-white/20 text-sm font-light tracking-[0.1em] hover:bg-white/5 transition"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <section className="pb-32 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-4xl md:text-6xl font-thin tracking-tight text-center mb-16">
                Frequently Asked
              </h3>

              <div className="space-y-6">
                {[
                  {
                    q: 'Can I change plans anytime?',
                    a: 'Yes, upgrade or downgrade your plan at any time. Changes take effect immediately.',
                  },
                  {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major credit cards, PayPal, and wire transfers for enterprise plans.',
                  },
                  {
                    q: 'Do unused credits roll over?',
                    a: 'Yes, unused AI generation credits roll over for up to 3 months on paid plans.',
                  },
                  {
                    q: 'Is there a free trial?',
                    a: 'All new users receive 6 free AI generations to test the platform. No credit card required.',
                  },
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="border-b border-white/5 pb-6"
                  >
                    <h4 className="text-lg font-light tracking-wide mb-3">
                      {faq.q}
                    </h4>
                    <p className="text-sm font-extralight text-gray-500 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/[0.02] border border-white/5 rounded-lg p-16"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-6 text-white/40" strokeWidth={1} />
              <h3 className="text-4xl md:text-5xl font-thin tracking-tight mb-6">
                Need a Custom Plan?
              </h3>
              <p className="text-sm font-extralight text-gray-400 tracking-wide mb-8 max-w-xl mx-auto">
                Enterprise solutions with custom AI training, dedicated infrastructure, and white-glove support
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-3 bg-white text-black text-sm font-light tracking-[0.1em] rounded hover:bg-white/90 transition-all"
              >
                Own the lot
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-[10px] font-extralight tracking-[0.3em] text-gray-600 uppercase">
              2024 Tangibel • All Rights Reserved
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
