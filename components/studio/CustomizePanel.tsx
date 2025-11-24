'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, CircleDot, Armchair, Cog, Box, Sparkles, Wand2, Wrench } from 'lucide-react'

type PartCategory = 'all' | 'body' | 'wheels' | 'interior' | 'engine' | 'frame' | 'accessories'

interface CustomizePanelProps {
  onCategoryChange?: (category: PartCategory | null) => void
  onSmooth?: (strength: number) => void
  onRepair?: () => void
}

export default function CustomizePanel({ onCategoryChange, onSmooth, onRepair }: CustomizePanelProps) {
  const [activeCategory, setActiveCategory] = useState<PartCategory | null>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [smoothStrength, setSmoothStrength] = useState(50)

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
      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id as PartCategory)}
              className={`px-3 py-2 border transition-all text-[11px] font-extralight tracking-wide uppercase ${
                isActive
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Icon className="w-3 h-3" />
                <span>{category.name}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Category Details */}
      {activeCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white/5 border border-white/10"
        >
          {activeCategory === 'all' ? (
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
              <span className="text-gray-400">Total Parts</span>
              <span className="text-white">0</span>
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              No parts loaded yet
            </div>
          )}
        </motion.div>
      )}

      {/* Mesh Editing Tools */}
      <div className="pt-4 border-t border-white/10 space-y-4">
        <div>
          <h4 className="text-xs font-light text-white mb-3 flex items-center gap-2">
            <Wand2 className="w-3 h-3" />
            Mesh Tools
          </h4>
          
          {/* Smoothing */}
          <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">Smooth Surface</label>
              <span className="text-xs text-white">{smoothStrength}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={smoothStrength}
              onChange={(e) => setSmoothStrength(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            />
            <button
              onClick={() => onSmooth?.(smoothStrength)}
              className="w-full mt-3 px-3 py-2 bg-white text-black rounded text-xs font-light hover:bg-gray-200 transition-colors"
            >
              Apply Smoothing
            </button>
          </div>

          {/* Mesh Repair */}
          <div className="p-3 bg-white/5 border border-white/10 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-3 h-3 text-gray-400" />
              <label className="text-xs text-gray-400">Auto-Fix Mesh</label>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Fix holes, self-intersections, and non-manifold geometry
            </p>
            <button
              onClick={() => onRepair?.()}
              className="w-full px-3 py-2 bg-white text-black rounded text-xs font-light hover:bg-gray-200 transition-colors"
            >
              Repair Model
            </button>
          </div>
        </div>
      </div>

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
