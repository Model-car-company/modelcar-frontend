'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Store, X, DollarSign, Ticket, Download, Printer, MessageCircle, Trophy, Image as ImageIcon, Instagram, Music, Bot } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
// import Model3DUploader from '../components/Model3DUploader'
// import ModelCatalog from '../components/ModelCatalog'
import HeroSection from '../components/HeroSection'

export default function Home() {
  const [currentModel, setCurrentModel] = useState(0)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const y1 = useTransform(scrollYProgress, [0, 0.5], ['0%', '20%'])
  const y2 = useTransform(scrollYProgress, [0, 0.5], ['0%', '10%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  
  const models = [
    {
      id: '01',
      name: 'GRANBEAT',
      subtitle: 'Ultimate Precision Masterpiece',
      year: '2024',
      scale: '1:18',
      edition: 'Limited Edition',
      description: 'Meticulously crafted with obsessive attention to detail. Every curve, every line, every surface finish replicated to perfection.',
      image: '/features/i_want_you_to_create_a_card_design_very_similar_to_this_car_design_09wtxux3n4byspgmqcwp_3.png',
    },
    {
      id: '02', 
      name: 'SILHOUETTE',
      subtitle: 'Racing Heritage Refined',
      year: '2024',
      scale: '1:24',
      edition: 'Signature Series',
      description: 'A celebration of motorsport excellence. Hand-assembled components with authentic racing livery and carbon fiber detailing.',
      image: '/features/i_want_you_to_create_a_card_design_very_similar_to_this_car_design_e7pg03fe7u5etxxshcsc_3.png',
    },
    {
      id: '03',
      name: 'ETHEREAL',
      subtitle: 'Future Classic Collection',
      year: '2024',
      scale: '1:12',
      edition: 'Artist Edition',
      description: 'Where art meets engineering. Each model individually numbered and signed by our master craftsmen.',
      image: '/features/i_want_you_to_create_a_card_design_very_similar_to_this_car_design_ior5ussxvs42nyv0z40a_3.png',
    },
    {
      id: '04',
      name: 'VELOCITY',
      subtitle: 'Performance Art Edition',
      year: '2024',
      scale: '1:18',
      edition: 'Exclusive Series',
      description: 'The perfect fusion of speed and elegance. Premium materials and authentic detailing bring this masterpiece to life.',
      image: '/features/i_want_you_to_create_a_card_design_very_similar_to_this_car_design_ok0d3nxo93vw6h0boaqe_1.png',
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
            <div className="text-xl font-thin tracking-[0.2em]">OFFENSE</div>
            <div className="hidden md:flex gap-12 text-[11px] font-extralight tracking-[0.2em] uppercase">
              {/* <Link href="/studio" className="hover:opacity-60 transition-opacity flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                3D STUDIO
              </Link> */}
              <Link href="/pricing" className="hover:opacity-60 transition-opacity">PRICING</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection y1={y1} y2={y2} opacity={opacity} />

      {/* THE PROBLEM Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16 text-center">
          <h2 className="text-4xl md:text-6xl font-thin tracking-tight mb-20">
            You Can't Find These Cars <span className="text-red-400">Anywhere Else</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                <Store className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-light mb-3 whitespace-nowrap">Generic Models</h3>
              <p className="text-sm font-extralight text-gray-400">
                Hot Wheels makes the same cars everyone has. Nothing unique, nothing exclusive.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                <X className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-light mb-3 whitespace-nowrap">No Custom Options</h3>
              <p className="text-sm font-extralight text-gray-400">
                Want a model of YOUR car? Good luck finding it.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-light mb-3 whitespace-nowrap">Expensive Customs</h3>
              <p className="text-sm font-extralight text-gray-400">
                Commission artists charge $200+ per model. One car. One time.
              </p>
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-light mt-20 text-red-400"
          >
            That's why we built this.
          </motion.p>
        </div>
      </section>

      {/* Product Showcase - This Month's Drops */}
      <section className="min-h-screen relative py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="mb-20 text-center">
            <h3 className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">Showcase Gallery</h3>
            <h2 className="text-4xl md:text-6xl font-thin tracking-tight">This Month's Drops</h2>
            <p className="text-sm font-extralight text-gray-400 mt-4">Exclusive concept cars you won't find anywhere else</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Model Image Area */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-900/10 to-black rounded-sm overflow-hidden">
              <div className="absolute inset-0 glass-dark" />
              <motion.div 
                className="absolute inset-0"
                key={currentModel}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={models[currentModel].image}
                  alt={models[currentModel].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
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
                  <h3 className="text-4xl md:text-5xl font-thin mb-2 whitespace-nowrap">
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

      {/* How It Works Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="mb-20 text-center">
            <h3 className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">Simple Process</h3>
            <h2 className="text-4xl md:text-6xl font-thin tracking-tight">From Screen to Shelf in 3 Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            {[
              { 
                num: '01', 
                title: 'Subscribe', 
                desc: 'Choose your tier - as low as $9/month',
                Icon: Ticket
              },
              { 
                num: '02', 
                title: 'Download', 
                desc: 'Get instant access to weekly drops + vault of past designs',
                Icon: Download
              },
              { 
                num: '03', 
                title: 'Print & Build', 
                desc: 'Use any 3D printer - we provide pre-sliced files and print guides',
                Icon: Printer
              },
            ].map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                  <step.Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
                <div className="text-5xl font-thin opacity-20 mb-4">{step.num}</div>
                <h4 className="text-xl font-light mb-4 whitespace-nowrap">{step.title}</h4>
                <p className="text-sm font-extralight text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="mb-20">
            <h3 className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">What You Get</h3>
            <h2 className="text-4xl md:text-6xl font-thin tracking-tight">Membership Benefits</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {[
              { title: 'Weekly Drops', desc: 'New exclusive concept car every week - cyberpunk, retro-futuristic, and sci-fi designs' },
              { title: 'Custom AI Models', desc: 'Upload photos of your real car and download a custom 3D-printable replica (AI-powered)' },
              { title: 'Unlimited Downloads', desc: 'Print as many copies as you want - keep your favorites, gift them, or sell them' },
              { title: 'Member Perks', desc: 'Vote on next drops, early access to limited editions, exclusive colorways' },
              { title: 'Print Anywhere', desc: 'Works with Ender, Prusa, Bambu, or any FDM/resin printer' },
              { title: 'Multiple Formats', desc: 'STL, OBJ, and pre-sliced files included for easy printing' },
              { title: 'Community Gallery', desc: 'Share your builds, get inspired, connect with other collectors' },
              { title: 'Support Included', desc: 'Printing tips, troubleshooting guides, and active Discord community' },
            ].map((feature) => (
              <div key={feature.title} className="bg-black p-12 hover:bg-white/[0.02] transition-colors">
                <h4 className="text-base font-light mb-3 whitespace-nowrap">{feature.title}</h4>
                <p className="text-[11px] font-extralight text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium 3D Model Catalog */}
      {/* <ModelCatalog /> */}

      {/* 3D Model Converter Section */}
      {/* <Model3DUploader /> */}

      {/* THE COMMUNITY Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="mb-20 text-center">
            <h3 className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">Join Us</h3>
            <h2 className="text-4xl md:text-6xl font-thin tracking-tight">Built By Collectors, For Collectors</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-sm p-8"
            >
              <div className="w-12 h-12 mb-4 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-light mb-4 whitespace-nowrap">Discord Server</h3>
              <ul className="space-y-2 text-sm font-extralight text-gray-400">
                <li>• Daily discussions</li>
                <li>• Print tips & troubleshooting</li>
                <li>• Show off your builds</li>
                <li>• Trade files (coming soon)</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-sm p-8"
            >
              <div className="w-12 h-12 mb-4 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-light mb-4 whitespace-nowrap">Monthly Contests</h3>
              <ul className="space-y-2 text-sm font-extralight text-gray-400">
                <li>• Best paint job wins</li>
                <li>• Community votes</li>
                <li>• Winners get featured</li>
                <li>• Free month subscription</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-sm p-8"
            >
              <div className="w-12 h-12 mb-4 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-light mb-4 whitespace-nowrap">Member Gallery</h3>
              <ul className="space-y-2 text-sm font-extralight text-gray-400">
                <li>• User-submitted prints</li>
                <li>• Before/after photos</li>
                <li>• Build inspiration</li>
                <li>• Connect with builders</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRICING Section - Commented out */}

      {/* FAQ Section */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-8 md:px-16">
          <div className="mb-20 text-center">
            <h3 className="text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">Support</h3>
            <h2 className="text-4xl md:text-6xl font-thin tracking-tight">Questions? We've Got Answers</h2>
          </div>

          <div className="space-y-8">
            {[
              {
                q: 'What file formats do you provide?',
                a: 'STL, OBJ, and pre-sliced G-code for popular printers.'
              },
              {
                q: 'What printers work?',
                a: 'Any FDM or resin printer - Ender, Prusa, Bambu, Anycubic, Elegoo, and more.'
              },
              {
                q: 'Can I sell prints?',
                a: 'Yes, with our Merchant tier ($149/month) you get a commercial license.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, no contracts. Cancel anytime from your account dashboard.'
              },
              {
                q: 'Do you ship physical models?',
                a: 'No, we provide digital files only. You print them at home or through a print service.'
              },
              {
                q: 'What if I don\'t have a 3D printer?',
                a: 'We\'re partnering with print services for those who want physical models without owning a printer (coming Q2 2025).'
              },
              {
                q: 'How do I customize cars?',
                a: 'Our AI custom car creator launches Q2 2025. Upload photos of YOUR car and get a printable 3D model.'
              },
              {
                q: 'Can I request specific cars?',
                a: 'Members vote on which concept drops next! Your voice shapes our catalog.'
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/10 pb-6"
              >
                <h3 className="text-base font-light mb-3">{faq.q}</h3>
                <p className="text-sm font-extralight text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access CTA Section */}
      <section className="py-32 border-t border-white/5 bg-gradient-to-b from-transparent via-red-500/5 to-transparent">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-sm font-light text-red-400 uppercase tracking-wider">Limited Spots</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-thin mb-8">
              Be a <span className="text-red-400">Founding Member</span>
            </h2>
            
            <div className="max-w-2xl mx-auto mb-12">
              <p className="text-lg font-extralight text-gray-300 mb-6">
                Lock in $9/month forever (price increases to $15 after launch)
              </p>
              <ul className="text-sm font-extralight text-gray-400 space-y-2">
                <li>✓ Lifetime access to founder-exclusive drops</li>
                <li>✓ Your name in the credits</li>
                <li>✓ First 100 members get free commercial license upgrade</li>
              </ul>
            </div>

            <Link 
              href="/pricing"
              className="inline-block px-12 py-4 bg-red-500 hover:bg-red-600 text-white font-light text-lg rounded-sm transition-all"
            >
              Join the Garage - Founders Only
            </Link>
            
            <p className="text-sm font-extralight text-red-400 mt-6">
              87 spots left • Launching March 1st
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div>
              <div className="font-light text-lg tracking-[0.3em] uppercase mb-4">Offense</div>
              <p className="text-xs font-extralight text-gray-500 leading-relaxed mb-6">
                Exclusive 3D-printable concept cars. New drops every week.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-colors">
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-colors">
                  <Instagram className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-colors">
                  <Music className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-colors">
                  <Bot className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-light uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2 text-xs font-extralight text-gray-500">
                <li><a href="#collection" className="hover:text-white transition-colors">Collection</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                {/* <li><Link href="/studio" className="hover:text-white transition-colors">3D Studio</Link></li> */}
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-light uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2 text-xs font-extralight text-gray-500">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Print Guides</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-light uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-xs font-extralight text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">License Terms</a></li>
              </ul>
            </div>
          </div>

          {/* Email Signup */}
          <div className="py-12 border-t border-white/5 mb-12">
            <div className="max-w-md mx-auto text-center">
              <h4 className="text-sm font-light uppercase tracking-wider mb-4">Stay Updated</h4>
              <p className="text-xs font-extralight text-gray-500 mb-4">
                Get notified when we launch and receive exclusive drops
              </p>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).Tally) {
                    (window as any).Tally.openPopup('688ydk', {
                      layout: 'modal',
                      width: 500,
                      autoClose: 3000
                    })
                  }
                }}
                className="w-full px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-light rounded-sm transition-all hover:bg-red-500/30"
              >
                Join Waitlist
              </button>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-[10px] font-extralight text-gray-500">
              © 2025 Offense. All rights reserved.
            </p>
            <p className="text-[10px] font-extralight text-gray-600 mt-4 md:mt-0">
              Made with ❤️ for car enthusiasts and 3D printing collectors
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
