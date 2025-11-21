'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Star, Download, Plus, Info } from 'lucide-react'
import { useStudioStore } from '@/lib/store/studio-store'
import { CarPart, PartCategory } from '@/lib/types/car-parts'
import Image from 'next/image'

export default function PartLibrary() {
  const {
    selectedCategory,
    setSelectedCategory,
    addPartToAssembly,
    selectedPart,
    setSelectedPart
  } = useStudioStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [parts, setParts] = useState<CarPart[]>([])
  const [loading, setLoading] = useState(false)

  const categories: { id: PartCategory; name: string; icon: string }[] = [
    { id: 'body', name: 'Body', icon: '🚗' },
    { id: 'wheels', name: 'Wheels', icon: '⚙️' },
    { id: 'interior', name: 'Interior', icon: '🪑' },
    { id: 'engine', name: 'Engine', icon: '🔧' },
    { id: 'frame', name: 'Frame', icon: '🏗️' },
    { id: 'accessories', name: 'Accessories', icon: '✨' },
  ]

  // Fetch parts when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchParts(selectedCategory)
    }
  }, [selectedCategory])

  const fetchParts = async (category: PartCategory) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/parts?category=${category}`)
      const data = await response.json()
      setParts(data.parts || [])
    } catch (error) {
      console.error('Failed to fetch parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPart = (part: CarPart) => {
    if (selectedCategory) {
      addPartToAssembly(selectedCategory, part)
      setSelectedPart(null)
    }
  }

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-black/30 border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-thin tracking-wider mb-4">PART LIBRARY</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-white/5">
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded text-xs flex flex-col items-center gap-1 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Parts Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : selectedCategory ? (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredParts.map((part) => (
                <PartCard
                  key={part.id}
                  part={part}
                  onSelect={() => setSelectedPart(part)}
                  onAdd={() => handleAddPart(part)}
                  selected={selectedPart?.id === part.id}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a category to browse parts
          </div>
        )}
      </div>

      {/* Part Details Panel */}
      <AnimatePresence>
        {selectedPart && (
          <PartDetailsPanel
            part={selectedPart}
            onClose={() => setSelectedPart(null)}
            onAdd={() => handleAddPart(selectedPart)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface PartCardProps {
  part: CarPart
  onSelect: () => void
  onAdd: () => void
  selected: boolean
}

function PartCard({ part, onSelect, onAdd, selected }: PartCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group relative bg-white/5 border rounded-lg overflow-hidden cursor-pointer transition-all ${
        selected
          ? 'border-red-500/50 shadow-lg shadow-red-500/20'
          : 'border-white/10 hover:border-white/30'
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-black/50 relative">
        {part.thumbnailUrl ? (
          <Image
            src={part.thumbnailUrl}
            alt={part.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🚗
          </div>
        )}
        
        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAdd()
          }}
          className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-light truncate mb-1">{part.name}</h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            {part.rating && (
              <>
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                {part.rating}
              </>
            )}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {part.downloads || 0}
          </span>
        </div>
        {part.price && (
          <div className="mt-2 text-xs text-red-400 font-medium">
            ${part.price.toFixed(2)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface PartDetailsPanelProps {
  part: CarPart
  onClose: () => void
  onAdd: () => void
}

function PartDetailsPanel({ part, onClose, onAdd }: PartDetailsPanelProps) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute inset-y-0 right-0 w-80 bg-black/95 border-l border-white/10 backdrop-blur-sm overflow-y-auto"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-light mb-1">{part.name}</h3>
            <p className="text-xs text-gray-400">{part.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            ×
          </button>
        </div>

        {/* Thumbnail */}
        <div className="aspect-video bg-black/50 rounded mb-4 relative">
          {part.thumbnailUrl && (
            <Image
              src={part.thumbnailUrl}
              alt={part.name}
              fill
              className="object-cover rounded"
            />
          )}
        </div>

        {/* Description */}
        {part.description && (
          <p className="text-sm text-gray-300 mb-4">{part.description}</p>
        )}

        {/* Specs */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Dimensions</span>
            <span className="text-white">
              {part.dimensions.width} × {part.dimensions.height} × {part.dimensions.depth} mm
            </span>
          </div>
          {part.printTime && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Print Time</span>
              <span className="text-white">{Math.round(part.printTime / 60)}h</span>
            </div>
          )}
          {part.filamentWeight && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Filament</span>
              <span className="text-white">{part.filamentWeight}g</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {part.tags && part.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {part.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => {
            onAdd()
            onClose()
          }}
          className="w-full py-3 bg-red-500 hover:bg-red-600 rounded font-light text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add to Build
        </button>
      </div>
    </motion.div>
  )
}
