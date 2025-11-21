'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, CircleDot, Armchair, Cog, Box, Sparkles } from 'lucide-react'

type PartCategory = 'all' | 'body' | 'wheels' | 'interior' | 'engine' | 'frame' | 'accessories'

interface CustomizePanelProps {
  onCategoryChange?: (category: PartCategory | null) => void
}

export default function CustomizePanel({ onCategoryChange }: CustomizePanelProps) {
  const [activeCategory, setActiveCategory] = useState<PartCategory | null>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', name: 'View All', icon: Car, description: 'See complete assembled car', isViewAll: true },
    { id: 'body', name: 'Body', icon: Car, description: 'Exterior panels, paint, body kits' },
    { id: 'wheels', name: 'Wheels', icon: CircleDot, description: 'Rims, tires, suspension' },
    { id: 'interior', name: 'Interior', icon: Armchair, description: 'Seats, dashboard, steering' },
    { id: 'engine', name: 'Engine', icon: Cog, description: 'Engine bay components' },
    { id: 'frame', name: 'Frame', icon: Box, description: 'Chassis, structure' },
    { id: 'accessories', name: 'Accessories', icon: Sparkles, description: 'Spoilers, lights, exhaust' },
  ]

  const handleCategoryClick = (categoryId: PartCategory) => {
    const newCategory = activeCategory === categoryId ? null : categoryId
    setActiveCategory(newCategory)
    onCategoryChange?.(newCategory)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-light text-white mb-1">Customize Parts</h3>
        <p className="text-xs text-gray-400">
          Select a category to browse and add parts to your car
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search parts..."
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm font-light focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id
          const isViewAll = category.id === 'all'
          
          return (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryClick(category.id as PartCategory)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                isViewAll && isActive
                  ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50 shadow-lg shadow-red-500/20'
                  : isActive
                  ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/10'
                  : isViewAll
                  ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/20 hover:border-red-500/30 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${isActive ? 'bg-red-500/20' : 'bg-white/10'}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-light mb-1 ${isActive ? 'text-red-400' : 'text-white'}`}>
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {category.description}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Active Category Details */}
      {activeCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 border border-white/10 rounded-lg"
        >
          {activeCategory === 'all' ? (
            <>
              <div className="text-xs font-light text-gray-400 mb-2">
                Assembly Overview
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Total Parts</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Completion</span>
                  <span className="text-white font-medium">0%</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-400 mb-2">Assembly Status</div>
                  <div className="text-sm text-white">
                    No parts added yet. Start by adding body, wheels, or other components.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-light text-gray-400 mb-2">
                Available Parts
              </div>
              <div className="text-sm text-white">
                No parts loaded yet. Upload 3D models or connect to a library.
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <button className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors">
          📁 Import Custom Part
        </button>
        <button className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors">
          🌐 Browse Online Library
        </button>
      </div>
    </div>
  )
}
