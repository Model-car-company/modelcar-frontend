'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Palette, Sparkles, Target, Zap, Package } from 'lucide-react'

export default function FeaturesSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  const features = [
    {
      title: 'Museum Quality',
      description: 'Each model is crafted to museum-grade standards with archival materials',
      icon: Star,
    },
    {
      title: 'Custom Orders',
      description: 'Bring your dream car to life with our bespoke model creation service',
      icon: Palette,
    },
    {
      title: 'Limited Editions',
      description: 'Exclusive runs of rare and iconic vehicles for discerning collectors',
      icon: Sparkles,
    },
    {
      title: 'Authenticity Guaranteed',
      description: 'Licensed reproductions with manufacturer-approved specifications',
      icon: Target,
    },
    {
      title: 'Expert Restoration',
      description: 'Professional restoration services for vintage model collections',
      icon: Zap,
    },
    {
      title: 'Global Shipping',
      description: 'Secure worldwide delivery with premium packaging and insurance',
      icon: Package,
    },
  ]

  return (
    <section ref={ref} id="features" className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Why Choose
            <span className="block text-gradient">Tangibel</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Excellence in every detail, satisfaction in every delivery
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="gradient-border rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group"
            >
              <feature.icon className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
