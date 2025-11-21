'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Palette, Ruler, Sparkles, Target } from 'lucide-react'

export default function ProcessSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  const steps = [
    {
      number: '01',
      title: 'Design & Planning',
      description: 'Every masterpiece begins with meticulous research and detailed blueprints',
      icon: Palette,
    },
    {
      number: '02',
      title: 'Precision Crafting',
      description: 'State-of-the-art tools meet traditional craftsmanship techniques',
      icon: Ruler,
    },
    {
      number: '03',
      title: 'Detailing & Painting',
      description: 'Hand-painted finishes and authentic detailing bring models to life',
      icon: Sparkles,
    },
    {
      number: '04',
      title: 'Quality Assurance',
      description: 'Rigorous inspection ensures perfection in every model',
      icon: Target,
    },
  ]

  return (
    <section ref={ref} id="process" className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            The Creation
            <span className="block text-gradient">Process</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From concept to completion, every step is executed with precision and passion
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-[1px] bg-gradient-to-r from-border to-transparent" />
              )}
              
              <div className="gradient-border rounded-2xl p-6 h-full hover:bg-white/5 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-bold text-accent/30">{step.number}</span>
                  <step.icon className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
