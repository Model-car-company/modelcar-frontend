'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Model3DUploader from '../components/Model3DUploader'
import ModelCatalog from '../components/ModelCatalog'

export default function Home() {
  const [currentModel, setCurrentModel] = useState(0)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  
  const models = [
    {
      id: '01',
      name: 'GRANBEAT',
      subtitle: 'Ultimate Precision Masterpiece',
      year: '2024',
      scale: '1:18',
      edition: 'Limited Edition',
      price: '€4,250',
      description: 'Meticulously crafted with obsessive attention to detail. Every curve, every line, every surface finish replicated to perfection.',
    },
    {
      id: '02', 
      name: 'SILHOUETTE',
      subtitle: 'Racing Heritage Refined',
      year: '2024',
      scale: '1:24',
      edition: 'Signature Series',
      price: '€3,450',
      description: 'A celebration of motorsport excellence. Hand-assembled components with authentic racing livery and carbon fiber detailing.',
    },
    {
      id: '03',
      name: 'ETHEREAL',
      subtitle: 'Future Classic Collection',
      year: '2024',
      scale: '1:12',
      edition: 'Artist Edition',
      price: '€5,850',
      description: 'Where art meets engineering. Each model individually numbered and signed by our master craftsmen.',
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Sophisticated Gradient Background */}
      <div className="fixed inset-0 z-0">
        {/* Main gradient orb - top right */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-radial from-gray-100/15 via-gray-300/8 to-transparent blur-3xl" />
        
        {/* Secondary gradient orb - center left */}
        <div className="absolute top-1/3 left-0 w-[800px] h-[800px] bg-gradient-radial from-white/12 via-gray-200/6 to-transparent blur-3xl" />
        
        {/* Tertiary gradient orb - bottom right */}
        <div className="absolute bottom-0 right-1/4 w-[900px] h-[900px] bg-gradient-radial from-gray-50/10 via-gray-400/5 to-transparent blur-3xl" />
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
      </div>
      
      {/* Content wrapper */}
      <div className="relative z-10">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-thin tracking-[0.2em]">MODEL MASTERS</div>
            <div className="hidden md:flex gap-12 text-[11px] font-extralight tracking-[0.2em] uppercase">
              <a href="#collection" className="hover:opacity-60 transition-opacity">COLLECTION</a>
              <a href="#process" className="hover:opacity-60 transition-opacity">PROCESS</a>
              <a href="#features" className="hover:opacity-60 transition-opacity">FEATURES</a>
              <Link href="/studio" className="hover:opacity-60 transition-opacity flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                3D STUDIO
              </Link>
              <Link href="/pricing" className="hover:opacity-60 transition-opacity">PRICING</Link>
              <a href="#contact" className="hover:opacity-60 transition-opacity">CONTACT</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          <div className="w-full h-full bg-gradient-radial from-gray-900/20 to-black" />
        </motion.div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[100px] md:text-[140px] lg:text-[180px] leading-[0.8] font-thin tracking-tighter mb-6">
              CRAFT<span className="font-extralight">ED</span>
            </h1>
            <p className="text-xs md:text-sm font-extralight tracking-[0.3em] uppercase mb-2">
              of
            </p>
            <h2 className="text-[80px] md:text-[120px] lg:text-[160px] leading-[0.8] font-thin tracking-tighter opacity-40">
              PERFECTION
            </h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-[11px] font-extralight tracking-[0.2em] uppercase text-gray-400 mt-12"
          >
            Miniature Masterpieces • Since 2009
          </motion.p>
        </div>

        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* Product Showcase */}
      <section className="min-h-screen relative py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="mb-20">
            <h3 className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">Collection</h3>
            <h2 className="text-5xl md:text-7xl font-thin tracking-tight">Featured Models</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Model Image Area */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-900/10 to-black rounded-sm overflow-hidden">
              <div className="absolute inset-0 glass-dark" />
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                key={currentModel}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-[200px] font-thin opacity-10">{models[currentModel].id}</div>
                  <p className="text-xs font-extralight tracking-[0.2em] uppercase text-gray-500">Model Preview</p>
                </div>
              </motion.div>
            </div>

            {/* Model Details */}
            <div className="flex flex-col justify-between">
              <div>
                <motion.div
                  key={currentModel}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-[10px] font-light tracking-[0.3em] uppercase text-gray-400 mb-4">
                    {models[currentModel].edition}
                  </p>
                  <h3 className="text-5xl md:text-6xl font-thin mb-2">
                    {models[currentModel].name}
                  </h3>
                  <p className="text-sm font-extralight text-gray-400 mb-8">
                    {models[currentModel].subtitle}
                  </p>
                  
                  <div className="space-y-6 mb-12">
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span className="text-[11px] font-extralight tracking-[0.2em] uppercase text-gray-500">Scale</span>
                      <span className="text-sm font-light">{models[currentModel].scale}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span className="text-[11px] font-extralight tracking-[0.2em] uppercase text-gray-500">Year</span>
                      <span className="text-sm font-light">{models[currentModel].year}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span className="text-[11px] font-extralight tracking-[0.2em] uppercase text-gray-500">Price</span>
                      <span className="text-sm font-light">{models[currentModel].price}</span>
                    </div>
                  </div>

                  <p className="text-sm font-extralight leading-relaxed text-gray-300 mb-12">
                    {models[currentModel].description}
                  </p>
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <button className="btn-minimal">View Details</button>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setCurrentModel((prev) => (prev - 1 + models.length) % models.length)}
                    className="p-3 border border-white/10 hover:bg-white/5 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-extralight">
                    {String(currentModel + 1).padStart(2, '0')} / {String(models.length).padStart(2, '0')}
                  </span>
                  <button 
                    onClick={() => setCurrentModel((prev) => (prev + 1) % models.length)}
                    className="p-3 border border-white/10 hover:bg-white/5 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="mb-20">
            <h3 className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">Design Process</h3>
            <h2 className="text-5xl md:text-7xl font-thin tracking-tight">Precision Crafted</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Research', desc: 'Exhaustive study of original blueprints and specifications' },
              { num: '02', title: 'Modeling', desc: 'CAD precision meets traditional sculpting techniques' },
              { num: '03', title: 'Detailing', desc: 'Hand-finished components with microscopic accuracy' },
              { num: '04', title: 'Assembly', desc: 'Master craftsmen bring each piece to life' },
            ].map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-6xl font-thin opacity-10 mb-4">{step.num}</div>
                <h4 className="text-sm font-light mb-2">{step.title}</h4>
                <p className="text-[11px] font-extralight text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-3 gap-px bg-white/5">
            {[
              { title: 'Museum Grade', desc: 'Archival quality materials' },
              { title: 'Limited Editions', desc: 'Numbered and certified' },
              { title: 'Bespoke Service', desc: 'Custom commissions' },
              { title: 'Global Delivery', desc: 'Insured worldwide shipping' },
              { title: 'Authentication', desc: 'Certificate of provenance' },
              { title: 'Restoration', desc: 'Expert conservation services' },
            ].map((feature) => (
              <div key={feature.title} className="bg-black p-12 hover:bg-white/[0.02] transition-colors">
                <h4 className="text-lg font-light mb-3">{feature.title}</h4>
                <p className="text-[11px] font-extralight text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium 3D Model Catalog */}
      <ModelCatalog />

      {/* 3D Model Converter Section */}
      <Model3DUploader />

      {/* CTA Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-6xl md:text-8xl font-thin mb-8">Begin Your<br/>Collection</h2>
          <p className="text-sm font-extralight text-gray-400 mb-12 max-w-md mx-auto">
            Join an exclusive community of collectors who appreciate the finest in miniature automotive art.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-minimal">View Catalog</button>
            <button className="btn-minimal">Schedule Consultation</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="font-light text-xs tracking-[0.3em] uppercase mb-2">Model Masters</div>
              <p className="text-[10px] font-extralight text-gray-500">Crafting Excellence Since 2009</p>
            </div>
            
            <div className="flex gap-8 mt-8 md:mt-0">
              <a href="#" className="text-[10px] font-extralight tracking-[0.2em] uppercase hover:opacity-60 transition-opacity">Instagram</a>
              <a href="#" className="text-[10px] font-extralight tracking-[0.2em] uppercase hover:opacity-60 transition-opacity">Privacy</a>
              <a href="#" className="text-[10px] font-extralight tracking-[0.2em] uppercase hover:opacity-60 transition-opacity">Terms</a>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-[10px] font-extralight text-gray-500">© 2024 Model Masters. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
