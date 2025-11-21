'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Package } from 'lucide-react'

export default function ShowcaseSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [activeIndex, setActiveIndex] = useState(0)

  const models = [
    {
      name: 'Classic GT40',
      year: '1966',
      scale: '1:18',
      price: '$2,450',
      description: 'Meticulous recreation of the legendary Le Mans winner',
      features: ['Hand-painted details', 'Opening doors & hood', 'Authentic interior'],
    },
    {
      name: 'Modern Hypercar',
      year: '2024',
      scale: '1:24',
      price: '$1,850',
      description: 'Cutting-edge design meets precision craftsmanship',
      features: ['Carbon fiber texture', 'LED lighting', 'Rotating wheels'],
    },
    {
      name: 'Vintage Roadster',
      year: '1957',
      scale: '1:12',
      price: '$3,200',
      description: 'Timeless elegance in miniature form',
      features: ['Real leather seats', 'Wire wheels', 'Chrome details'],
    },
  ]

  return (
    <section ref={ref} id="collection" className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Showcase
            <span className="block text-gradient">Collection</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each model is a testament to our dedication to perfection and attention to detail
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Model Selector */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {models.map((model, index) => (
              <motion.div
                key={model.name}
                whileHover={{ x: 10 }}
                onClick={() => setActiveIndex(index)}
                className={`gradient-border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  activeIndex === index ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{model.name}</h3>
                    <p className="text-sm text-muted-foreground">Scale: {model.scale} • Year: {model.year}</p>
                  </div>
                  <span className="text-2xl font-bold text-accent">{model.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                <div className="flex flex-wrap gap-2">
                  {model.features.map((feature) => (
                    <span key={feature} className="text-xs px-3 py-1 glass rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Model Display */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="sticky top-32">
              <div className="aspect-video glass rounded-2xl overflow-hidden p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full bg-gradient-to-br from-accent/10 to-purple-500/10 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div 
                        className="w-48 h-48 mx-auto mb-4 relative"
                        animate={{ rotateY: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent to-purple-500 rounded-3xl" />
                        <div className="absolute inset-2 bg-background rounded-2xl flex items-center justify-center">
                          <Package className="w-16 h-16 text-accent" />
                        </div>
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2">{models[activeIndex].name}</h3>
                      <p className="text-muted-foreground">Interactive 3D Preview</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.div 
                className="mt-6 flex justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
              >
                {models.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeIndex === index ? 'w-8 bg-accent' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
