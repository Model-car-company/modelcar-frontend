'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Play, ChevronLeft, ChevronRight, DollarSign, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface FeaturedModel {
  id: string
  name: string
  thumbnail: string
  creator: string
  hearts_count: number
  category?: string
}

// Fallback showcase data for when API is unavailable
const fallbackModels: FeaturedModel[] = [
  {
    id: '1',
    name: 'Gaming Controller Stand',
    thumbnail: '/landing/hyper-realistic_product_photography_of_a_premium_matte_black_playstation_5_controller_stand_sculptu_9s1b9abr34r7xophd3kl_0.png',
    creator: 'Xrista3D',
    hearts_count: 234,
  },
  {
    id: '2',
    name: 'Jordan 1 Collectible',
    thumbnail: '/landing/hyper-realistic_cinematic_product_photography_of_a_premium_miniature_air_jordan_1_sneaker_collectib_x55o7ni2yc7no7jeip4o_2.png',
    creator: 'MAKR4U',
    hearts_count: 189,
  },
  {
    id: '3',
    name: 'Anime Warrior Statue',
    thumbnail: '/landing/hyper-realistic_cinematic_product_photography_of_a_premium_collector_statue_of_a_powerful_anime_war_ffffudbzsf9dq51j82g3_3.png',
    creator: 'HighVelocity99',
    hearts_count: 156,
  },
  {
    id: '4',
    name: 'Geometric Phone Dock',
    thumbnail: '/landing/hyper-realistic_cinematic_product_photography_of_a_minimalist_geometric_smartphone_dock_sculptural__f171xth62e367hkde9ks_0.png',
    creator: 'StudioVibes',
    hearts_count: 312,
  },
  {
    id: '5',
    name: 'Modern Phone Stand',
    thumbnail: '/landing/hyper-realistic_cinematic_product_photography_of_a_minimalist_geometric_smartphone_dock_sculptural__4xjxb8vtsybikmtj3bve_2.png',
    creator: 'TheRealMaker',
    hearts_count: 278,
  },
  {
    id: '6',
    name: 'Desk Organizer Set',
    thumbnail: '/landing/hyper-realistic_cinematic_product_photography_of_a_premium_modular_desk_organizer_set_clean_geometr_5ozd43j2lcal2f001k6l_1.png',
    creator: 'PixelDreams_',
    hearts_count: 342,
  },
  {
    id: '7',
    name: 'Succulent Planter',
    thumbnail: '/landing/hyper-realistic_cinematic_product_photography_of_a_premium_sculptural_succulent_planter_elegant_flo_845ka5y5z1wehlee9lke_0.png',
    creator: 'Create.Daily',
    hearts_count: 267,
  },
]

export default function CreatorShowcase() {
  // Use static fallback models only - no API fetch
  const [models] = useState<FeaturedModel[]>(fallbackModels)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', updateScrollButtons)
      updateScrollButtons()
      return () => container.removeEventListener('scroll', updateScrollButtons)
    }
  }, [models])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-16 sm:py-24 lg:py-32 border-t border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-green-500/10 via-emerald-500/5 to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 relative">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[10px] sm:text-[11px] font-extralight tracking-[0.3em] uppercase text-green-400 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            CREATOR MARKETPLACE
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin tracking-tight mb-6">
            Own Or Sell Your Creations
          </h2>
          <p className="text-sm sm:text-base font-extralight text-gray-400 max-w-2xl mx-auto mb-8">
            Share your designs with the world and earn 30% on every sale. Join our community of creators turning ideas into income.
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-thin text-white">30%</div>
              <div className="text-[10px] font-light text-gray-500 uppercase tracking-wider">Creator Earnings</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-thin text-white flex items-center gap-1">
                <Users className="w-5 h-5 text-green-400" />
                500+
              </div>
              <div className="text-[10px] font-light text-gray-500 uppercase tracking-wider">Active Creators</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-thin text-white">∞</div>
              <div className="text-[10px] font-light text-gray-500 uppercase tracking-wider">Possibilities</div>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Scroll Button */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all -ml-6"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Right Scroll Button */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all -mr-6"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scrollable Cards */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {models.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[280px] sm:w-[320px] group cursor-pointer"
              >
                {/* Card - Subtle curve */}
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 group-hover:border-white/30 transition-all">
                  {/* Thumbnail */}
                  <Image
                    src={model.thumbnail}
                    alt={model.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="320px"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Play button overlay - commented out since these are pictures not videos
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <Play className="w-6 h-6 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  */}

                  {/* Stats badges - Bottom left */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 text-xs">
                        <Heart className="w-3 h-3 text-red-400" fill="currentColor" />
                        <span className="text-white/80">{model.hearts_count || 0}</span>
                      </div>
                      {/* Category badge - commented out
                      {model.category && (
                        <div className="bg-black/50 backdrop-blur-sm px-2 py-1 text-xs text-white/60 capitalize">
                          {model.category}
                        </div>
                      )}
                      */}
                    </div>
                  </div>

                  {/* Green "Earning" indicator - Top right */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm border border-green-500/40 px-2 py-1">
                      <DollarSign className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] font-light text-green-400">Earning</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-3 px-1">
                  <h3 className="text-sm font-light text-white truncate">{model.name}</h3>
                  <p className="text-xs font-light text-gray-500 flex items-center gap-1 mt-1">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                    {model.creator}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section - Commented out for now
        <div className="text-center mt-12">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-gradient-to-r from-green-500/80 to-emerald-500/80 border border-green-500/40 text-white text-sm font-light tracking-wide hover:from-green-500 hover:to-emerald-500 transition-all flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Start Selling Today
            </Link>
            <Link
              href="/garage"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white text-sm font-light tracking-wide hover:bg-white/10 transition-all"
            >
              Browse Gallery
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            No upfront costs • Instant payouts • Keep 30% of every sale
          </p>
        </div>
        */}

        {/* Start Selling CTA - White button */}
        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-sm font-light tracking-wide hover:bg-gray-100 transition-all"
          >
            Start Selling Today
          </Link>
        </div>
      </div>
    </section>
  )
}
