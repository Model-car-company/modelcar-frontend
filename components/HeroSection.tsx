'use client'

import { motion, MotionValue } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight, ChevronDown, Package, Sparkles } from 'lucide-react'

interface HeroSectionProps {
  y1: MotionValue<number>
  y2: MotionValue<number>
  opacity: MotionValue<number>
}

export default function HeroSection({ y1, y2, opacity }: HeroSectionProps) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 opacity-20">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-purple-500/30 rounded-full blur-2xl animate-pulse" />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center space-x-2 px-4 py-2 glass rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Precision in Every Detail</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Crafting
            <span className="block text-gradient">Miniature Masterpieces</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Where automotive passion meets artistic precision. Every model tells a story of excellence.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-black font-medium rounded-full flex items-center space-x-2 hover-glow transition-smooth"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 glass border border-border rounded-full font-medium transition-smooth hover:bg-white/10"
            >
              View Process
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          className="mt-20 relative"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video glass rounded-2xl overflow-hidden p-8">
              <div className="w-full h-full bg-gradient-to-br from-accent/10 to-purple-500/10 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent to-purple-500 rounded-2xl animate-pulse" />
                    <div className="absolute inset-2 bg-background rounded-xl flex items-center justify-center">
                      <Package className="w-12 h-12 text-accent" />
                    </div>
                  </div>
                  <p className="text-muted-foreground">Featured Model Preview</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-muted-foreground" />
      </motion.div>
    </section>
  )
}
