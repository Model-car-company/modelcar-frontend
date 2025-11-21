'use client'

import { motion, MotionValue } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  y1: MotionValue<string>
  y2: MotionValue<string>
  opacity: MotionValue<number>
}

export default function HeroSection({ y1, y2, opacity }: HeroSectionProps) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
      {/* Subtle background gradient */}
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-red-500/5 to-transparent rounded-full blur-3xl" />
        </div>
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center space-x-2 px-4 py-2 glass rounded-sm mb-8"
          >
            <Sparkles className="w-3 h-3 text-red-400" />
            <span className="text-xs font-extralight tracking-wider text-gray-300 uppercase">Coming Soon</span>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extralight mb-8 leading-tight tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Build the <span className="font-light text-white">Dream Garage</span> You Can't Afford
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base md:text-lg font-extralight text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Can't drop $44K on a Mustang GT? Own it as a detailed 3D model. Print it. Display it. Build your entire collection without the car payment.
          </motion.p>

          {/* Social Proof */}
          <motion.p
            className="text-sm font-extralight text-gray-500 mb-16"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Join 247 collectors on the waitlist
          </motion.p>

          {/* Join Waitlist Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            <motion.button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).Tally) {
                  (window as any).Tally.openPopup('688ydk', {
                    layout: 'modal',
                    width: 500,
                    autoClose: 3000
                  })
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-light rounded-sm transition-all hover:bg-red-500/30 backdrop-blur-sm"
            >
              Join Waitlist
            </motion.button>
            
            <p className="text-xs font-extralight text-gray-500 mt-4">
              Get notified when we launch + exclusive founder benefits
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-5 h-5 text-gray-600" />
      </motion.div>
    </section>
  )
}
