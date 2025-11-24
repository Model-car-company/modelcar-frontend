'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  creditsRemaining: number
  requiredCredits?: number
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  creditsRemaining, 
  requiredCredits = 1 
}: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false)

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-black border border-white/10 w-full max-w-4xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Left Side - Image */}
                <div className="w-full md:w-1/2 bg-white/5 border-r border-white/10 relative min-h-[300px] md:min-h-[500px]">
                  <Image
                    src="/popup/Gemini_Generated_Image_jhy12ijhy12ijhy1.png"
                    alt="Upgrade"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Right Side - Upgrade Content */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  {/* Title */}
                  <h2 className="text-3xl font-thin tracking-tight mb-8">
                    Upgrade your plan
                  </h2>

                  {/* Price */}
                  <div className="mb-8">
                    <p className="text-5xl font-thin text-white mb-2">$9</p>
                    <p className="text-sm font-light text-gray-500">per month • 500 credits</p>
                  </div>

                  {/* Benefits List */}
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

                  {/* Upgrade Button - Red Glass like sidebar */}
                  <Link
                    href="/pricing"
                    className="block w-full bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-500/20 border border-red-500/30 text-white py-4 text-center font-light tracking-wide hover:from-red-500/30 hover:via-red-600/20 hover:to-red-500/30 transition-all"
                  >
                    Upgrade Now
                  </Link>

                  {/* Footer Note */}
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
