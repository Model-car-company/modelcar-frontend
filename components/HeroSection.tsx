'use client'

import { motion, MotionValue } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown, Sparkles } from 'lucide-react'
import Image from 'next/image'

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

      {/* Sleek Interface Lines - Hub Design */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Diagonal Lines - Top Left to Bottom Right */}
        <motion.div
          initial={{ opacity: 0, pathLength: 0 }}
          animate={inView ? { opacity: 0.15, pathLength: 1 } : {}}
          transition={{ duration: 2, delay: 0.8 }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0%" y1="20%" x2="100%" y2="80%" stroke="white" strokeWidth="0.5" opacity="0.3" />
            <line x1="10%" y1="0%" x2="90%" y2="100%" stroke="white" strokeWidth="0.5" opacity="0.2" />
          </svg>
        </motion.div>

        {/* Horizontal Lines - Left Side */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1 }}
          className="absolute left-0 top-1/3 w-64 h-px bg-gradient-to-r from-white/40 via-white/20 to-transparent origin-left"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="absolute left-0 top-1/2 w-48 h-px bg-gradient-to-r from-white/30 via-white/15 to-transparent origin-left"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.4 }}
          className="absolute left-0 top-2/3 w-56 h-px bg-gradient-to-r from-white/35 via-white/18 to-transparent origin-left"
        />

        {/* Horizontal Lines - Right Side */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.1 }}
          className="absolute right-0 top-1/4 w-72 h-px bg-gradient-to-l from-white/40 via-white/20 to-transparent origin-right"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.3 }}
          className="absolute right-0 top-1/2 w-52 h-px bg-gradient-to-l from-white/30 via-white/15 to-transparent origin-right"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="absolute right-0 top-3/4 w-64 h-px bg-gradient-to-l from-white/35 via-white/18 to-transparent origin-right"
        />

        {/* Connection Nodes - Left */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 2.5 }}
          className="absolute left-0 top-1/3 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 2.7 }}
          className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 2.9 }}
          className="absolute left-0 top-2/3 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />

        {/* Connection Nodes - Right */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 2.6 }}
          className="absolute right-0 top-1/4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 2.8 }}
          className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 3 }}
          className="absolute right-0 top-3/4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />

        {/* Vertical Lines */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.8, delay: 1.6 }}
          className="absolute left-1/4 top-0 w-px h-1/3 bg-gradient-to-b from-transparent via-white/20 to-transparent origin-top"
        />
        <motion.div
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.8, delay: 1.8 }}
          className="absolute right-1/4 bottom-0 w-px h-1/3 bg-gradient-to-t from-transparent via-white/20 to-transparent origin-bottom"
        />

        {/* Corner Brackets - Top Left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.4 } : {}}
          transition={{ duration: 1, delay: 2 }}
          className="absolute top-24 left-8 w-12 h-12"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-white/40" />
          <div className="absolute top-0 left-0 w-px h-full bg-white/40" />
        </motion.div>

        {/* Corner Brackets - Bottom Right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.4 } : {}}
          transition={{ duration: 1, delay: 2.2 }}
          className="absolute bottom-24 right-8 w-12 h-12"
        >
          <div className="absolute bottom-0 right-0 w-full h-px bg-white/40" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-white/40" />
        </motion.div>

        {/* Technical Labels */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 0.5, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="absolute left-16 top-1/3 text-[9px] font-light tracking-[0.3em] text-white/60 uppercase"
        >
          INTERFACE
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={inView ? { opacity: 0.5, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 2.7 }}
          className="absolute right-16 top-3/4 text-[9px] font-light tracking-[0.3em] text-white/60 uppercase text-right"
        >
          SYSTEM
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center space-x-2 px-4 py-2 glass rounded-sm mb-8"
          >
            <Sparkles className="w-3 h-3 text-red-400" />
            <span className="text-xs font-extralight tracking-wider text-gray-300 uppercase">Beta</span>
          </motion.div> */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extralight mb-8 leading-tight tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Make Your <span className="font-light text-white">Dreams</span> Tangible
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base md:text-lg font-extralight text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Design custom 3D models with AI and get them printed and shipped to your door, Starting with custom car collectibles.
          </motion.p>

          {/* Get Early Access Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-light rounded-sm transition-all hover:bg-red-500/30 backdrop-blur-sm"
            >
              Get Early Access
            </motion.a>
            
            {/* <p className="text-xs font-extralight text-gray-500 mt-4">
              Start creating your dream garage today + exclusive founder benefits
            </p> */}
          </motion.div>
        </motion.div>
      </div>

      {/* Top Left Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: [1, 0.8, 0.3, 0, 0, 0, 0.3, 0.8, 1], scale: [1, 0.98, 0.96, 0.95, 0.95, 0.95, 0.96, 0.98, 1] } : { opacity: 0, scale: 0.8 }}
        transition={{ 
          opacity: { duration: 16, delay: 1.2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 16, delay: 1.2, repeat: Infinity, ease: "easeInOut" },
          initial: { duration: 1, delay: 1.2 }
        }}
        className="absolute top-32 left-8 w-32 h-20 md:w-40 md:h-24 lg:w-48 lg:h-28"
      >
        <div className="relative w-full h-full border border-white/10 rounded-lg overflow-hidden">
          <Image
            src="/landing/Gemini_Generated_Image_ct4rdhct4rdhct4r.png"
            alt="3D Model Preview"
            fill
            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
            sizes="(max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* Top Right Shoe Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: [1, 0.8, 0.3, 0, 0, 0, 0.3, 0.8, 1], scale: [1, 0.98, 0.96, 0.95, 0.95, 0.95, 0.96, 0.98, 1] } : { opacity: 0, scale: 0.8 }}
        transition={{ 
          opacity: { duration: 16, delay: 2.8, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 16, delay: 2.8, repeat: Infinity, ease: "easeInOut" },
          initial: { duration: 1, delay: 1.8 }
        }}
        className="absolute top-40 right-12 w-32 h-20 md:w-40 md:h-24 lg:w-44 lg:h-28"
      >
        <div className="relative w-full h-full border border-white/10 rounded-lg overflow-hidden">
          <Image
            src="/landing/Create_a_nice_detailed_shoe_for_running_and_make_it_look_like_this_design.jpg"
            alt="Running Shoe Design"
            fill
            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
            sizes="(max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* Top Center Toy Showcase Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: [1, 0.8, 0.3, 0, 0, 0, 0.3, 0.8, 1], scale: [1, 0.98, 0.96, 0.95, 0.95, 0.95, 0.96, 0.98, 1] } : { opacity: 0, scale: 0.8 }}
        transition={{ 
          opacity: { duration: 16, delay: 5.2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 16, delay: 5.2, repeat: Infinity, ease: "easeInOut" },
          initial: { duration: 1, delay: 3.3 }
        }}
        className="absolute top-24 left-[calc(50%-80px)] -translate-x-0 w-40 h-24 md:w-48 md:h-28 lg:w-56 lg:h-32"
      >
        <div className="relative w-full h-full border border-white/10 rounded-lg overflow-hidden">
          <Image
            src="/landing/make_a_cool_toy_showcase__keep_the__background_sleek_.jpg"
            alt="Toy Showcase Design"
            fill
            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
            sizes="(max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-5 h-5 text-gray-600" />
      </motion.div>

      {/* Bottom Right Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: [1, 0.8, 0.3, 0, 0, 0, 0.3, 0.8, 1], scale: [1, 0.98, 0.96, 0.95, 0.95, 0.95, 0.96, 0.98, 1] } : { opacity: 0, scale: 0.8 }}
        transition={{ 
          opacity: { duration: 16, delay: 2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 16, delay: 2, repeat: Infinity, ease: "easeInOut" },
          initial: { duration: 1, delay: 1.5 }
        }}
        className="absolute bottom-8 right-8 w-32 h-20 md:w-40 md:h-24 lg:w-48 lg:h-28"
      >
        <div className="relative w-full h-full border border-white/10 rounded-lg overflow-hidden">
          <Image
            src="/landing/Gemini_Generated_Image_2kb57k2kb57k2kb5.png"
            alt="3D Model Preview"
            fill
            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
            sizes="(max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* Bottom Left Action Figure Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: [1, 0.8, 0.3, 0, 0, 0, 0.3, 0.8, 1], scale: [1, 0.98, 0.96, 0.95, 0.95, 0.95, 0.96, 0.98, 1] } : { opacity: 0, scale: 0.8 }}
        transition={{ 
          opacity: { duration: 16, delay: 3.6, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 16, delay: 3.6, repeat: Infinity, ease: "easeInOut" },
          initial: { duration: 1, delay: 2.1 }
        }}
        className="absolute bottom-16 left-12 w-32 h-20 md:w-40 md:h-24 lg:w-44 lg:h-28"
      >
        <div className="relative w-full h-full border border-white/10 rounded-lg overflow-hidden">
          <Image
            src="/landing/create_an_action_figure_that_is_cool_and_highly_detailed_.jpg"
            alt="Action Figure Design"
            fill
            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
            sizes="(max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* Bottom Center Robotics Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: [1, 0.8, 0.3, 0, 0, 0, 0.3, 0.8, 1], scale: [1, 0.98, 0.96, 0.95, 0.95, 0.95, 0.96, 0.98, 1] } : { opacity: 0, scale: 0.8 }}
        transition={{ 
          opacity: { duration: 16, delay: 4.4, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 16, delay: 4.4, repeat: Infinity, ease: "easeInOut" },
          initial: { duration: 1, delay: 2.7 }
        }}
        className="absolute bottom-24 left-[calc(50%-80px)] -translate-x-0 w-40 h-24 md:w-48 md:h-28 lg:w-56 lg:h-32"
      >
        <div className="relative w-full h-full border border-white/10 rounded-lg overflow-hidden">
          <Image
            src="/landing/make_a_cool_rebotics_design_look_of_it_s_parts_and_joints_.jpg"
            alt="Robotics Design"
            fill
            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
            sizes="(max-width: 768px) 256px, (max-width: 1024px) 288px, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </section>
  )
}
