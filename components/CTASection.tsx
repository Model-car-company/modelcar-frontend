'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section ref={ref} className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto gradient-border rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-purple-500/10 rounded-3xl" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-purple-500 rounded-2xl animate-pulse" />
              <div className="absolute inset-2 bg-background rounded-xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Start Your Collection Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of collectors who trust Tangibel for their premium miniature automotive art
            </p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-black font-medium rounded-full flex items-center space-x-2 hover-glow transition-smooth"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 glass border border-border rounded-full font-medium transition-smooth hover:bg-white/10"
              >
                Request Custom Model
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
