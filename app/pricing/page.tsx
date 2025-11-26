'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Building2, Factory } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import SubscribeButton from '../../components/SubscribeButton'
import { Toaster } from 'react-hot-toast'
import { SubscriptionTier } from '../../lib/subscription-config'

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  
  const tiers = [
    {
      name: 'Garage Parking',
      tierKey: 'garage' as SubscriptionTier,
      icon: Zap,
      price: 9,
      description: 'CPU-based generations for hobbyists and individual creators',
      features: [
        '50 AI generations/month',
        '10 GB cloud storage',
        'STL, OBJ, GLB exports',
        'Basic 3D viewer',
        'Community support',
        'Watermark on exports',
      ],
      cta: 'Start Creating',
      popular: false,
    },
    {
      name: 'Showroom Floor',
      tierKey: 'showroom' as SubscriptionTier,
      icon: Building2,
      price: 29,
      description: 'GPU-based generations for serious creators and small studios',
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
      cta: 'Go Pro',
      popular: true,
    },
    {
      name: 'Dealership',
      tierKey: 'dealership' as SubscriptionTier,
      icon: Building2,
      price: 49,
      description: 'GPU-based generations for commercial teams and design agencies',
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
      cta: 'Scale Up',
      popular: false,
    },
    {
      name: 'Factory Owner',
      tierKey: 'dealership' as SubscriptionTier, // Use dealership tier or handle as custom/contact sales
      icon: Factory,
      price: 199,
      description: 'GPU-based generations with enterprise-grade AI customization',
      isEnterprise: true,
      features: [
        'Everything in Dealership',
        'Custom AI model training',
        'Dedicated infrastructure',
        'Unlimited team seats',
        'SSO & advanced security',
        'SLA guarantee (99.9%)',
        'On-premise deployment option',
        'Dedicated account manager',
        'Custom integrations',
        'Priority feature requests',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

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
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white/[0.02] backdrop-blur-sm border rounded-lg p-8 hover:bg-white/[0.04] transition-all duration-300 ${
                  tier.popular
                    ? 'border-white/20 lg:-mt-6 lg:mb-[-24px]'
                    : 'border-white/5'
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-white text-black text-[10px] font-light tracking-[0.2em] uppercase rounded-full">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="mb-6">
                  <tier.icon className="w-8 h-8 text-white/40" strokeWidth={1} />
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
                      ${isYearly ? Math.floor(tier.price * 12 * 0.8) : tier.price}
                    </span>
                    <span className="text-sm font-extralight text-gray-500 tracking-wider">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  {isYearly && (
                    <p className="text-xs font-extralight text-gray-500 mt-2">
                      ${tier.price}/month billed annually
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  <SubscribeButton
                    tier={tier.tierKey}
                    billingInterval={isYearly ? 'year' : 'month'}
                    label={tier.cta}
                    popular={tier.popular}
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
            ))}
          </div>
        </div>
      </section>

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
                  a: 'All new users receive 10 free AI generations to test the platform. No credit card required.',
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
