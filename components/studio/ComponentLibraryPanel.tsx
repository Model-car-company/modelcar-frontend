'use client'

import { useState } from 'react'
import { Box, Circle, Minus } from 'lucide-react'
import Image from 'next/image'

interface Component3D {
  id: string
  name: string
  category: 'chassis' | 'exterior' | 'interior' | 'rims' | 'steering' | 'seat'
  path: string
  thumbnail?: string
}

interface ComponentLibraryPanelProps {
  onComponentSelect: (component: Component3D) => void
  selectedComponent: Component3D | null
}

const COMPONENT_LIBRARY: Component3D[] = [
  // Rims
  {
    id: 'rim-sport-1',
    name: 'Sport Rim',
    category: 'rims',
    path: '/3d-models/rims/a03fad0e-32fb-4408-af46-5c328c7320e8_white_mesh.glb',
  },
  
  // Steering
  {
    id: 'steering-racing-1',
    name: 'Racing Wheel',
    category: 'steering',
    path: '/3d-models/steering/steering-wheel-1.glb',
  },
  
  // Add more components as they're added to the library
]

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Box },
  { id: 'chassis', label: 'Chassis', icon: Minus },
  { id: 'exterior', label: 'Exterior', icon: Box },
  { id: 'interior', label: 'Interior', icon: Box },
  { id: 'rims', label: 'Rims', icon: Circle },
  { id: 'steering', label: 'Steering', icon: Circle },
  { id: 'seat', label: 'Seats', icon: Box },
]

export default function ComponentLibraryPanel({
  onComponentSelect,
  selectedComponent,
}: ComponentLibraryPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredComponents = COMPONENT_LIBRARY.filter((component) => {
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="h-full flex flex-col bg-black/90 border-l border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-light tracking-wide uppercase text-white mb-2">
          Component Library
        </h3>
        <p className="text-xs text-gray-500">
          Drag components onto your model
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-white/20"
        />
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-white/10">
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs transition-all ${
                  activeCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Icon size={12} />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Components Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-500">No components found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredComponents.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                isSelected={selectedComponent?.id === component.id}
                onSelect={() => onComponentSelect(component)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-white/10 bg-blue-500/10">
        <p className="text-xs text-blue-300 leading-relaxed">
          <strong>How to use:</strong><br />
          1. Select a component<br />
          2. Click on your model to place it<br />
          3. Use Boolean ops to merge/cut
        </p>
      </div>
    </div>
  )
}

interface ComponentCardProps {
  component: Component3D
  isSelected: boolean
  onSelect: () => void
}

function ComponentCard({ component, isSelected, onSelect }: ComponentCardProps) {
  return (
    <button
      onClick={onSelect}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('component', JSON.stringify(component))
      }}
      className={`group relative aspect-square border transition-all cursor-move ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      {/* Placeholder for 3D preview - you can add canvas here later */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Box className={`w-8 h-8 ${isSelected ? 'text-blue-400' : 'text-gray-600'}`} />
      </div>

      {/* Name */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-xs font-light text-white truncate">{component.name}</p>
        <p className="text-[10px] text-gray-500 uppercase">{component.category}</p>
      </div>

      {/* Drag indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 bg-white/30 rounded-full" />
      </div>
    </button>
  )
}

export type { Component3D }
