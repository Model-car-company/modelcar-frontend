'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Package, Ruler, Star, Zap } from 'lucide-react'

export default function StatsSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  const stats = [
    { value: '500+', label: 'Models Created', icon: Package },
    { value: '50K', label: 'Hours of Precision', icon: Ruler },
    { value: '99.9%', label: 'Client Satisfaction', icon: Star },
    { value: '15+', label: 'Years Experience', icon: Zap },
  ]

  return (
    <section ref={ref} className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="gradient-border rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-accent group-hover:scale-110 transition-transform" />
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
