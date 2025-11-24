'use client'

import { motion } from 'framer-motion'
import { Palette, ChevronRight } from 'lucide-react'

interface MaterialPanelProps {
  material: {
    metalness: number;
    roughness: number;
    color: string;
    wireframe: boolean;
  };
  viewMode?: 'solid' | 'wireframe' | 'normal' | 'uv';
  showGrid?: boolean;
  onMaterialChange: (material: any) => void;
  onViewModeChange?: (mode: 'solid' | 'wireframe' | 'normal' | 'uv') => void;
  onGridToggle?: (show: boolean) => void;
}

export default function MaterialPanel({ material, onMaterialChange, viewMode, showGrid, onViewModeChange, onGridToggle }: MaterialPanelProps) {
  const popularColors = [
    { name: 'Matte Black', color: '#1a1a1a', metalness: 0, roughness: 0.8 },
    { name: 'Gloss Black', color: '#0a0a0a', metalness: 0.8, roughness: 0.1 },
    { name: 'Racing Red', color: '#cc0000', metalness: 0.7, roughness: 0.2 },
    { name: 'Electric Blue', color: '#0066ff', metalness: 0.8, roughness: 0.3 },
    { name: 'Lime Green', color: '#39ff14', metalness: 0.6, roughness: 0.3 },
    { name: 'Pearl White', color: '#f5f5f5', metalness: 0.4, roughness: 0.2 },
    { name: 'Chrome', color: '#e8e8e8', metalness: 1, roughness: 0 },
    { name: 'Gold', color: '#FFD700', metalness: 1, roughness: 0.2 },
  ]
  
  const presets = [
    { name: 'Chrome', metalness: 1, roughness: 0, color: '#ffffff' },
    { name: 'Matte Black', metalness: 0, roughness: 0.8, color: '#1a1a1a' },
    { name: 'Carbon Fiber', metalness: 0.7, roughness: 0.3, color: '#2a2a2a' },
    { name: 'Glass', metalness: 0, roughness: 0, color: '#e3f2fd' },
    { name: 'Gold', metalness: 1, roughness: 0.2, color: '#FFD700' },
    { name: 'Rose Gold', metalness: 0.9, roughness: 0.3, color: '#E0BBE4' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Guidance Banner */}
      <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-start gap-2 mb-1">
          <Palette className="w-3 h-3 text-purple-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-purple-400">Instant Material Changes</p>
            <p className="text-xs text-gray-400 mt-1">Change colors and finishes in real-time. No API costs, unlimited tries!</p>
          </div>
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="text-xs font-light text-gray-400 mb-2 block">
          Base Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={material.color}
            onChange={(e) => onMaterialChange({ ...material, color: e.target.value })}
            className="w-12 h-10 bg-transparent border border-white/10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={material.color}
            onChange={(e) => onMaterialChange({ ...material, color: e.target.value })}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light"
          />
        </div>
      </div>

      {/* Metalness Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-light text-gray-400">Metalness</label>
          <span className="text-xs text-red-400">{Math.round(material.metalness * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={material.metalness * 100}
          onChange={(e) => onMaterialChange({ ...material, metalness: parseInt(e.target.value) / 100 })}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${material.metalness * 100}%, rgba(255,255,255,0.1) ${material.metalness * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
      </div>

      {/* Roughness Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-light text-gray-400">Roughness</label>
          <span className="text-xs text-red-400">{Math.round(material.roughness * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={material.roughness * 100}
          onChange={(e) => onMaterialChange({ ...material, roughness: parseInt(e.target.value) / 100 })}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${material.roughness * 100}%, rgba(255,255,255,0.1) ${material.roughness * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
      </div>

      {/* Popular Car Colors */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-light text-gray-400 mb-3">Popular Car Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {popularColors.map((color) => (
            <button
              key={color.name}
              onClick={() => onMaterialChange({
                ...material,
                color: color.color,
                metalness: color.metalness,
                roughness: color.roughness
              })}
              className="relative group"
              title={color.name}
            >
              <div 
                className="w-full aspect-square rounded-lg border-2 border-white/10 hover:border-white/40 transition-all hover:scale-110"
                style={{ backgroundColor: color.color }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {color.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Material Presets */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-light text-gray-400 mb-3">Material Finishes</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onMaterialChange({
                ...material,
                metalness: preset.metalness,
                roughness: preset.roughness,
                color: preset.color
              })}
              className="relative px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-white/20"
                  style={{ backgroundColor: preset.color }}
                />
                <span>{preset.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onMaterialChange({
              metalness: 0.7,
              roughness: 0.3,
              color: '#808080',
              wireframe: false
            })}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors"
          >
            Reset to Default
          </button>
          <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={material.wireframe}
              onChange={(e) => onMaterialChange({ ...material, wireframe: e.target.checked })}
              className="rounded border-gray-600 text-red-500 focus:ring-red-500 focus:ring-offset-0"
            />
            <span>Wireframe</span>
          </label>
        </div>
      </div>
    </motion.div>
  )
}
