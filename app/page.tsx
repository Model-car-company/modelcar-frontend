'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowRight, Sparkles, Box, Download, Zap, Image as ImageIcon, Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '../components/SimpleFooter'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import HeroSection from '../components/HeroSection'
import Landing3DViewer from '../components/Landing3DViewer'
import PublicNav from '../components/PublicNav'

// Step images for the scroll section
const stepImages = [
  '/landing/step1-describe-vision.png',
  '/landing/step2-ai-creates-model.png',
  '/landing/step3-ship-to-you.png',
]

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const { scrollYProgress } = useScroll()
  const y1 = useTransform(scrollYProgress, [0, 0.5], ['0%', '20%'])
  const y2 = useTransform(scrollYProgress, [0, 0.5], ['0%', '10%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  
  // Track active step for image switching
  const [activeStep, setActiveStep] = useState(0)
  const [showFixedImage, setShowFixedImage] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const stepsContainerRef = useRef<HTMLDivElement>(null)
  const step1Ref = useRef(null)
  const step2Ref = useRef(null)
  const step3Ref = useRef(null)
  
  const step1InView = useInView(step1Ref, { amount: 0.5 })
  const step2InView = useInView(step2Ref, { amount: 0.5 })
  const step3InView = useInView(step3Ref, { amount: 0.5 })
  
  // Show fixed image only when steps container is properly in view
  useEffect(() => {
    const handleScroll = () => {
      if (stepsContainerRef.current) {
        const rect = stepsContainerRef.current.getBoundingClientRect()
        // Show image when steps container top is above center of screen
        // and bottom is below 40% of screen height
        const isInStepsArea = rect.top < window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4
        setShowFixedImage(isInStepsArea)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    // Only update activeStep if at least one step is in view
    // This prevents jumping back to step 0 when scrolling past step 3
    if (step3InView) setActiveStep(2)
    else if (step2InView) setActiveStep(1)
    else if (step1InView) setActiveStep(0)
    // If no step is in view, keep the current activeStep
  }, [step1InView, step2InView, step3InView])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkAuth()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Sophisticated Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-radial from-gray-100/15 via-gray-300/8 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[800px] h-[800px] bg-gradient-radial from-white/12 via-gray-200/6 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[900px] h-[900px] bg-gradient-radial from-gray-50/10 via-gray-400/5 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
      </div>
      
      {/* Fixed Image Panel - Box background with left edge bleed */}
      <motion.div 
        className="hidden lg:block fixed left-0 top-0 w-1/2 h-screen z-40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: showFixedImage ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Centered box container with vertical margins */}
        <div className="absolute left-0 top-[12%] bottom-[12%] right-8">
          {/* Box background - lighter gray, sharp edges */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-300/20 via-gray-400/15 to-gray-500/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-gray-200/10 to-transparent" />
          
          {/* Image container - centered within the box */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-2xl relative">
              {/* All images stacked, only active one visible */}
              {stepImages.map((src, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeStep === index ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Image
                    src={src}
                    alt={`Step ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Content wrapper */}
      <div className="relative z-10">

      {/* Navigation */}
      <PublicNav />

      {/* Hero Section */}
      <HeroSection y1={y1} y2={y2} opacity={opacity} />

      {/* How It Works Section - Scroll-triggered with Fixed Image */}
      <section ref={sectionRef} className="relative border-t border-l border-r border-white/5">

        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
          {/* Section Header */}
          <div className="text-center py-16 sm:py-24">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
              SIMPLE 3-STEP PROCESS
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-thin tracking-tight">
              From Idea to Reality
            </h2>
          </div>

          {/* Steps Container - Right side on desktop */}
          <div ref={stepsContainerRef} className="lg:ml-[50%] pb-16 sm:pb-24">
            {/* Step 1 */}
            <div
              ref={step1Ref}
              className="min-h-[80vh] flex flex-col justify-center relative py-16"
            >
              {/* Sleek Progress Line - white gradient fade */}
              <div className="absolute left-0 top-0 bottom-0 w-px">
                <motion.div 
                  className="w-full bg-gradient-to-b from-white/40 via-white/20 to-transparent"
                  initial={{ height: "0%" }}
                  animate={{ height: step1InView ? "100%" : "0%" }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              
              <div className="pl-6">
                <p className="text-[10px] font-extralight tracking-[0.3em] uppercase text-white/50 mb-4">
                  STEP 01
                </p>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight mb-6 text-white">
                  Describe Your Vision
                </h3>
                <p className="text-base font-extralight text-gray-400 leading-relaxed max-w-md">
                  Type a prompt or upload a reference image. Be as detailed or simple as you like—our AI understands natural language.
                </p>
              </div>

              {/* Mobile Image - sharp edges */}
              <div className="lg:hidden mt-8 pl-6">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/10">
                  <Image
                    src="/landing/step1-describe-vision.png"
                    alt="Describe your vision"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              ref={step2Ref}
              className="min-h-[80vh] flex flex-col justify-center relative py-16"
            >
              {/* Sleek Progress Line - white gradient fade */}
              <div className="absolute left-0 top-0 bottom-0 w-px">
                <motion.div 
                  className="w-full bg-gradient-to-b from-white/40 via-white/20 to-transparent"
                  initial={{ height: "0%" }}
                  animate={{ height: step2InView ? "100%" : "0%" }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              
              <div className="pl-6">
                <p className="text-[10px] font-extralight tracking-[0.3em] uppercase text-white/50 mb-4">
                  STEP 02
                </p>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight mb-6 text-white">
                  AI Creates Your Model
                </h3>
                <p className="text-base font-extralight text-gray-400 leading-relaxed max-w-md">
                  Watch as AI generates your image and converts it to a fully-realized 3D model in seconds.
                </p>
              </div>

              {/* Mobile Image - sharp edges */}
              <div className="lg:hidden mt-8 pl-6">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/10">
                  <Image
                    src="/landing/step2-ai-creates-model.png"
                    alt="AI creates your model"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              ref={step3Ref}
              className="min-h-[80vh] flex flex-col justify-center relative py-16"
            >
              {/* Sleek Progress Line - white gradient fade */}
              <div className="absolute left-0 top-0 bottom-0 w-px">
                <motion.div 
                  className="w-full bg-gradient-to-b from-white/40 via-white/20 to-transparent"
                  initial={{ height: "0%" }}
                  animate={{ height: step3InView ? "100%" : "0%" }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              
              <div className="pl-6">
                <p className="text-[10px] font-extralight tracking-[0.3em] uppercase text-white/50 mb-4">
                  STEP 03
                </p>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight mb-6 text-white">
                  Ship Straight to You
                </h3>
                <p className="text-base font-extralight text-gray-400 leading-relaxed max-w-md">
                  Export your 3D model in any format and get it 3D printed and shipped directly to your door.
                </p>
              </div>

              {/* Mobile Image - sharp edges */}
              <div className="lg:hidden mt-8 pl-6">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/10">
                  <Image
                    src="/landing/step3-ship-to-you.png"
                    alt="Ship straight to you"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After - Personalize Your Car Section */}
      <section className="min-h-screen relative py-16 sm:py-24 lg:py-32 border-t border-white/5">
        <div className="border-l border-r border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-20">
              {/* <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
                YOUR CAR, YOUR WAY
              </p> */}
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight mb-6">
                Turn Your Picture Into a 3D Masterpiece
              </h2>
              <p className="text-sm sm:text-base font-extralight text-gray-400 max-w-2xl mx-auto">
                Upload a photo of your actual car and watch AI transform it into a fully customizable 3D model
              </p>
            </div>

            {/* Before/After Comparison */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
              {/* BEFORE - Photo */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute -top-6 left-0 z-10">
                  <span className="text-[10px] font-light tracking-[0.3em] uppercase text-gray-400 bg-black px-3 py-1 border border-white/10">
                    BEFORE
                  </span>
                </div>
                
                <div className="aspect-[4/3] bg-white/5 border border-white/10 rounded-sm overflow-hidden relative group">
                  <Image
                    src="/landing/Gemini_Generated_Image_5v80oa5v80oa5v80.png"
                    alt="Your car photo"
                    fill
                    className="object-cover opacity-90"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs font-extralight text-gray-300">Regular Photo</p>
                    <p className="text-lg font-light text-white mt-1">Upload any car image</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Any angle, any lighting</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>JPG, PNG, or HEIC</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Multiple photos for better results</span>
                  </div>
                </div>
              </motion.div>

              {/* Arrow */}
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* AFTER - 3D Model */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -top-6 left-0 z-10">
                  <span className="text-[10px] font-light tracking-[0.3em] uppercase text-gray-400 bg-black px-3 py-1 border border-white/10">
                    AFTER
                  </span>
                </div>
                
                <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-sm overflow-hidden relative group">
                  <Image
                    src="/landing/Gemini_Generated_Image_wsgn3cwsgn3cwsgn.png"
                    alt="3D model result"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs font-extralight text-gray-300">Interactive 3D Model</p>
                    <p className="text-lg font-light text-white mt-1">Ready to customize & print</p>
                  </div>
                  
                  {/* 3D Badge */}
                  <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm px-3 py-1 border border-white/20 rounded">
                    <span className="text-xs font-light text-white">3D</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Rotate & zoom in real-time</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Customize colors, wheels, parts</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Export as STL for 3D printing</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link 
                href="/studio"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-light tracking-wide hover:bg-gray-100 transition-all"
              >
                TRY IT NOW
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-xs text-gray-500 mt-4">
                Get early access now
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 border-t border-white/5">
        <div className="border-l border-r border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
            <div className="text-center mb-12 sm:mb-20">
              <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
                COMPLETE CREATIVE WORKFLOW
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight mb-4 sm:mb-6">
                Everything You Need
              </h2>
              <p className="text-sm sm:text-base font-extralight text-gray-400 max-w-2xl mx-auto">
                From concept to 3D-printable model in minutes, not hours
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-white/10">
            {/* Feature 1: AI Image Generation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="group border-r border-b border-white/10 p-8 sm:p-12 hover:bg-white/5 transition-all"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/20 rounded flex items-center justify-center mb-6">
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-lg sm:text-xl font-light mb-3">AI Image Generation</h3>
              <p className="text-sm font-extralight text-gray-400 mb-6 leading-relaxed">
                Describe your dream car and watch AI bring it to life with photorealistic detail. Perfect lighting, angles, and composition every time.
              </p>
              
              <ul className="space-y-2 text-xs font-light text-gray-500">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Photorealistic AI rendering</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Upload reference images</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Multiple style presets</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 2: 3D Model Creation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group border-r border-b border-white/10 p-8 sm:p-12 hover:bg-white/5 transition-all"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/20 rounded flex items-center justify-center mb-6">
                <Box className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-lg sm:text-xl font-light mb-3">3D Model Conversion</h3>
              <p className="text-sm font-extralight text-gray-400 mb-6 leading-relaxed">
                Transform any image into a fully-realized 3D model. Our AI understands depth, form, and structure to create accurate models.
              </p>
              
              <ul className="space-y-2 text-xs font-light text-gray-500">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Image-to-3D in minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Interactive 3D viewer</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Real-time preview</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 3: STL Export */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group border-r border-b border-white/10 p-8 sm:p-12 hover:bg-white/5 transition-all"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-white/20 to-white/10 border border-white/30 rounded flex items-center justify-center mb-6">
                <Download className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-lg sm:text-xl font-light mb-3">Print-Ready STL Files</h3>
              <p className="text-sm font-extralight text-gray-400 mb-6 leading-relaxed">
                Download optimized STL, OBJ, or GLB files ready for 3D printing. Perfect topology and scaling for professional results.
              </p>
              
              <ul className="space-y-2 text-xs font-light text-gray-500">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Multiple export formats</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Optimized for 3D printing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Commercial license included</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 4: Ship Your Designs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group border-r border-b border-white/10 p-8 sm:p-12 hover:bg-white/5 transition-all"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/20 rounded flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-lg sm:text-xl font-light mb-3">We Ship Your Designs</h3>
              <p className="text-sm font-extralight text-gray-400 mb-6 leading-relaxed">
                Don't have a 3D printer? No problem. We'll print your custom model in premium materials and ship it straight to your door.
              </p>
              
              <ul className="space-y-2 text-xs font-light text-gray-500">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Professional-grade printing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Multiple materials & finishes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span>Worldwide shipping</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-16 sm:py-24 lg:py-32 border-t border-l border-r border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
              POWERFUL FEATURES
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight">
              Build Every Detail To Desire
            </h2>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
            {/* Row 1 - Left: Large Feature Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 lg:row-span-2 rounded-lg overflow-hidden relative group hover:scale-[1.02] transition-transform"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src="/landing/Gemini_Generated_Image_hbumkohbumkohbum.png" 
                  alt="Industry-leading speed"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
            </motion.div>

            {/* Row 1 - Right Top: 22K */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-lg overflow-hidden relative hover:scale-[1.02] transition-transform border border-white/10"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src="/landing/a7e8e6c3a8557775b1f555920359ade4.jpg" 
                  alt="22K Upscaling"
                  className="w-full h-full object-contain object-center"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-all" />
            </motion.div>

            {/* Row 1 - Right Top: Custom Frames */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden relative hover:bg-white/10 transition-all border border-white/10"
            >
              <div className="h-full flex flex-col justify-center p-6">
                <h3 className="text-xl font-thin mb-2">Custom Frames</h3>
                <p className="text-xs font-light text-gray-400">Design roll cages, chassis, structural parts</p>
              </div>
            </motion.div>

            {/* Row 1 - Right Bottom: Interior Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 rounded-lg overflow-hidden relative group hover:scale-[1.02] transition-transform"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/landing/Gemini_Generated_Image_7jqtwo7jqtwo7jqt.png"
                  alt="Interior Design"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-3xl sm:text-4xl font-thin">Interior Design</h3>
              </div>
            </motion.div>

            {/* Row 2 - Left: Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="rounded-lg overflow-hidden relative hover:scale-[1.02] transition-transform"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/landing/Gemini_Generated_Image_qfqaf0qfqaf0qfqa.png"
                  alt="Design showcase"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-all" />
            </motion.div>

            {/* Row 2 - Center Right: KREA 1 (Large 2x2) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 lg:row-span-2 rounded-lg overflow-hidden relative group hover:scale-[1.02] transition-transform"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/landing/_ynh4ozrhtumukeoscbge_0.png"
                  alt="Krea 1"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
              </div>
            </motion.div>

            {/* Row 2 - Right: Rim Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden relative hover:bg-white/10 transition-all border border-white/10"
            >
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-2xl font-thin mb-2">Rim Design</h3>
                <p className="text-xs font-light text-gray-400">Create custom wheels and rim styles</p>
              </div>
            </motion.div>

            {/* Row 3 - Left: Asset Manager */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-lg overflow-hidden relative group hover:scale-[1.02] transition-transform"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
              <div className="relative h-full flex flex-col justify-center p-6">
                <h3 className="text-2xl font-thin mb-2">Fast Prototype</h3>
                <p className="text-xs font-light text-gray-400">Rapid iteration from concept to 3D model</p>
              </div>
            </motion.div>

            {/* Row 3 - Right: Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              className="rounded-lg overflow-hidden relative hover:scale-[1.02] transition-transform"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/landing/Gemini_Generated_Image_85a2af85a2af85a2.png"
                  alt="Latest models"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-all" />
            </motion.div>

            {/* Row 4 - Left: 1000+ Styles */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-500/10 to-teal-600/10 rounded-lg overflow-hidden relative group hover:scale-[1.02] transition-transform"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
              <div className="relative h-full flex flex-col justify-center p-6">
                <h3 className="text-2xl font-thin mb-1">1000+</h3>
                <p className="text-sm font-light">styles</p>
              </div>
            </motion.div> */}

            {/* Row 4 - Center: Image Editor */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55 }}
              className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 rounded-lg overflow-hidden relative group hover:scale-[1.02] transition-transform"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
              <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-2xl font-light">Image</h3>
                <p className="text-2xl font-light">Editor</p>
              </div>
            </motion.div> */}

            {/* Row 4 - Right: Lipsync */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden relative hover:bg-white/10 transition-all border border-white/10"
            >
              <div className="h-full flex flex-col items-center justify-center p-6">
                <div className="mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-sm font-light">Lipsync</h3>
              </div>
            </motion.div> */}
          </div>
        </div>
      </section>

      {/* Membership Benefits Section */}
      <section className="py-16 sm:py-24 lg:py-32 border-t border-l border-r border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
              WHAT YOU GET
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight">
            Premium Materials Library
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10">
            {/* Material 1 - PLA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-base sm:text-lg font-light mb-2">PLA Plastic</h3>
              <p className="text-xs sm:text-sm font-extralight text-gray-400 leading-relaxed">
                Eco-friendly bioplastic perfect for detailed models. Easy to print, minimal warping, vibrant colors.
              </p>
            </motion.div>

            {/* Material 2 - PETG */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-base sm:text-lg font-light mb-2">PETG Composite</h3>
              <p className="text-xs sm:text-sm font-extralight text-gray-400 leading-relaxed">
                Durable and chemical-resistant. Ideal for functional parts that need strength and flexibility.
              </p>
            </motion.div>

            {/* Material 3 - ABS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-base sm:text-lg font-light mb-2">ABS Pro</h3>
              <p className="text-xs sm:text-sm font-extralight text-gray-400 leading-relaxed">
                Industrial-grade toughness. Heat-resistant and impact-strong for professional-grade models.
              </p>
            </motion.div>

            {/* Material 4 - Resin */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-base sm:text-lg font-light mb-2">Resin SLA</h3>
              <p className="text-xs sm:text-sm font-extralight text-gray-400 leading-relaxed">
                Ultra-high detail with smooth surfaces. Perfect for display models and intricate details.
              </p>
            </motion.div>

            {/* Material 5 - TPU */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-base sm:text-lg font-light mb-2">TPU Flexible</h3>
              <p className="text-xs sm:text-sm font-extralight text-gray-400 leading-relaxed">
                Rubber-like flexibility for tires, bumpers, and flexible components. Shock-absorbent.
              </p>
            </motion.div>

            {/* Material 6 - Carbon Fiber */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-base sm:text-lg font-light mb-2">Carbon Fiber</h3>
              <p className="text-xs sm:text-sm font-extralight text-gray-400 leading-relaxed">
                Lightweight and incredibly strong. Premium finish for racing models and performance parts.
              </p>
            </motion.div>

            {/* Material 7 - Metal Filament */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-base sm:text-lg font-light mb-2">Metal Filament</h3>
              <p className="text-xs sm:text-sm font-extralight text-gray-400 leading-relaxed">
                Real metal particles for authentic weight and finish. Bronze, copper, and stainless steel options.
              </p>
            </motion.div>

            {/* Material 8 - Wood Composite */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-base sm:text-lg font-light mb-2">Wood Composite</h3>
              <p className="text-xs sm:text-sm font-extralight text-gray-400 leading-relaxed">
                Real wood fibers for natural texture and finish. Bamboo, pine, and walnut grain patterns.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Showcase Section - Platform Interface */}
      <section className="py-16 sm:py-24 lg:py-32 border-t border-l border-r border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
              SEAMLESS WORKFLOW
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight mb-6">
              Built for Speed and Precision
            </h2>
            <p className="text-sm sm:text-base font-extralight text-gray-400 max-w-2xl mx-auto">
              Professional-grade interface designed to get you from concept to 3D model in minutes
            </p>
          </div>

          {/* Main Showcase Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="aspect-[16/9] relative rounded-lg overflow-hidden border border-white/20 bg-white/5">
              <Image
                src="/landing/platform-interface.png"
                alt="Platform interface showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                priority
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:from-black/30 transition-all" />
              
              {/* Floating badges */}
              <div className="absolute top-6 right-6 flex gap-3">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 border border-white/20 rounded">
                  <span className="text-xs font-light text-white">Real-time Preview</span>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <div>
                    {/* <p className="text-xs font-extralight text-gray-300">Intuitive Controls</p> */}
                    {/* <p className="text-lg sm:text-xl font-light text-white mt-1">Everything at Your Fingertips</p> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature callouts */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded p-6 hover:bg-white/10 transition-all"
              >
                <h4 className="text-sm font-light mb-2">Instant Generation</h4>
                <p className="text-xs font-extralight text-gray-400">
                  From prompt to 3D model in under 5 minutes
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 border border-white/10 rounded p-6 hover:bg-white/10 transition-all"
              >
                <h4 className="text-sm font-light mb-2">Clean Interface</h4>
                <p className="text-xs font-extralight text-gray-400">
                  No clutter, just the tools you need
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded p-6 hover:bg-white/10 transition-all"
              >
                <h4 className="text-sm font-light mb-2">One-Click Export</h4>
                <p className="text-xs font-extralight text-gray-400">
                  Download in any format, ready to print
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive 3D Model Section */}
      <section className="py-16 sm:py-24 lg:py-32 border-t border-l border-r border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
              INTERACT WITH YOUR CREATION
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight mb-6">
              See It in Action
            </h2>
            <p className="text-sm sm:text-base font-extralight text-gray-400 max-w-2xl mx-auto">
              Rotate, zoom, and explore your 3D model from every angle in real-time
            </p>
          </div>

          {/* 3D Viewer Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="aspect-[16/9] relative rounded-lg overflow-hidden border border-white/20 bg-gradient-to-br from-white/5 to-black">
              <Landing3DViewer />
              
              {/* Interactive hints */}
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                <div className="flex items-center justify-between">
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-2 border border-white/20 rounded">
                    <p className="text-xs font-light text-white">Click and drag to rotate</p>
                  </div>
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-2 border border-white/20 rounded">
                    <p className="text-xs font-light text-white">Scroll to zoom</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features below 3D viewer */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded p-6 hover:bg-white/10 transition-all"
              >
                <h4 className="text-sm font-light mb-2">360° View</h4>
                <p className="text-xs font-extralight text-gray-400">
                  Examine every detail from any perspective
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 border border-white/10 rounded p-6 hover:bg-white/10 transition-all"
              >
                <h4 className="text-sm font-light mb-2">High-Quality Mesh</h4>
                <p className="text-xs font-extralight text-gray-400">
                  Production-ready topology and geometry
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded p-6 hover:bg-white/10 transition-all"
              >
                <h4 className="text-sm font-light mb-2">Real-time Rendering</h4>
                <p className="text-xs font-extralight text-gray-400">
                  Smooth performance on any device
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Stats Section - COMMENTED OUT */}
      {/* 
      <section className="py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
          <div className="text-center mb-12">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-2">
              TRUSTED BY CREATORS
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-thin mb-2">10K+</div>
              <p className="text-xs sm:text-sm font-extralight text-gray-500 uppercase tracking-wide">Images Generated</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-thin mb-2">5K+</div>
              <p className="text-xs sm:text-sm font-extralight text-gray-500 uppercase tracking-wide">3D Models</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-thin mb-2">1K+</div>
              <p className="text-xs sm:text-sm font-extralight text-gray-500 uppercase tracking-wide">Creators</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-thin mb-2">99%</div>
              <p className="text-xs sm:text-sm font-extralight text-gray-500 uppercase tracking-wide">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Use Cases Section - COMMENTED OUT
      <section className="py-16 sm:py-24 lg:py-32 border-t border-l border-r border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
              WHO IT'S FOR
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight">
              Built for Creators Like You
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            // Use Case 1
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-lg font-light mb-2">Aftermarket Design</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Create stunning car renders for YouTube thumbnails, Instagram posts, and video content without expensive photoshoots.
              </p>
            </motion.div>

            // Use Case 2
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-lg font-light mb-2">Car Enthusiasts</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Build your dream garage digitally. Generate and collect 3D models of your favorite cars for personal projects.
              </p>
            </motion.div>

            // Use Case 3
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-lg font-light mb-2">3D Printing Hobbyists</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Get print-ready STL files of custom car designs. Perfect for collectors building physical model collections.
              </p>
            </motion.div>

            // Use Case 4
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-lg font-light mb-2">Game Developers</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Generate vehicle assets for your games quickly. Export optimized 3D models ready for Unity or Unreal Engine.
              </p>
            </motion.div>

            // Use Case 5
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-lg font-light mb-2">Designers & Artists</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Prototype vehicle concepts rapidly. Transform sketches and ideas into 3D models for client presentations.
              </p>
            </motion.div>

            // Use Case 6
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="border-r border-b border-white/10 p-8 hover:bg-white/5 transition-all"
            >
              <h3 className="text-lg font-light mb-2">Car Brands</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Create custom automotive visuals for campaigns. Generate unique car renders without hiring photographers.
              </p>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* This Month's Drops Section - COMMENTED OUT FOR NOW
      <section className="min-h-screen relative py-16 sm:py-24 lg:py-32 border-t border-l border-r border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16">
          <div className="mb-12 sm:mb-20 text-center">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
              SHOWCASE GALLERY
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight mb-4">
              Drops Coming Soon
            </h2>
            <p className="text-sm font-extralight text-gray-400">
              Exclusive concept cars you won't find anywhere else
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-900/10 to-black rounded overflow-hidden border border-white/10">
              <motion.div 
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src="/features/i_want_you_to_create_a_card_design_very_similar_to_this_car_design_09wtxup3n4byspgmqcwp_3.png"
                  alt="GRANBEAT"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-[10px] font-light tracking-[0.3em] uppercase text-gray-400 mb-4">
                    LIMITED EDITION
                  </p>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-thin mb-2">
                    GRANBEAT
                  </h3>
                  <p className="text-sm font-extralight text-gray-400 mb-8">
                    Ultimate Precision Masterpiece
                  </p>

                  <p className="text-sm font-extralight text-gray-400 leading-relaxed mb-8">
                    Meticulously crafted with obsessive attention to detail. Every curve, every line, every surface finish replicated to perfection.
                  </p>

                  <Link 
                    href="/sign-up"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-sm font-light hover:bg-white/10 transition-all"
                  >
                    VIEW DETAILS
                  </Link>
                </motion.div>
              </div>

              <div className="flex items-center justify-between mt-8 lg:mt-0">
                <div className="flex items-center gap-4">
                  <button className="p-2 border border-white/10 hover:bg-white/5 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs font-light text-gray-500">01 / 02</span>
                  <button className="p-2 border border-white/10 hover:bg-white/5 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 lg:py-32 border-t border-l border-r border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-16">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-gray-400 mb-4">
              QUESTIONS?
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-thin tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-0">
            {/* FAQ 1 */}
            <div className="py-8 border-b border-white/5">
              <h3 className="text-base sm:text-lg font-light mb-3">How does the credit system work?</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Each image generation costs 1 credit, and each 3D model conversion costs 5 credits. You get 10 free credits to start, and can purchase more anytime.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="py-8 border-b border-white/5">
              <h3 className="text-base sm:text-lg font-light mb-3">Can I use the generated images commercially?</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Yes! All images and 3D models you generate are yours to use commercially. We include a full commercial license with every generation.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="py-8 border-b border-white/5">
              <h3 className="text-base sm:text-lg font-light mb-3">What file formats can I export?</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                3D models can be exported as STL (for 3D printing), OBJ, or GLB files. Images are available in PNG and JPEG formats.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="py-8 border-b border-white/5">
              <h3 className="text-base sm:text-lg font-light mb-3">How long does generation take?</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Images generate in 30-60 seconds. 3D model conversions take 3-5 minutes depending on complexity.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="py-8 border-b border-white/5">
              <h3 className="text-base sm:text-lg font-light mb-3">Can I customize the 3D models?</h3>
              <p className="text-sm font-extralight text-gray-400 leading-relaxed">
                Yes! Our interactive 3D viewer lets you adjust materials, colors, and viewing angles before export. Download and further edit in Blender or other 3D software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA is part of footer now; previous CTA section removed */}

      </div>
      <SimpleFooter />
    </div>
  )
}
