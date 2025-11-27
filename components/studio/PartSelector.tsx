'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Box, Eye, EyeOff } from 'lucide-react'
import { PartDetector, CarPart } from '../../lib/partDetection'
import * as THREE from 'three'

interface PartSelectorProps {
  geometry: THREE.BufferGeometry | null
  loadedModel?: THREE.Object3D
  onPartSelect?: (part: CarPart) => void
  onPartHighlight?: (partId: string, color: THREE.Color) => void
}

export default function PartSelector({ 
  geometry, 
  loadedModel,
  onPartSelect,
  onPartHighlight 
}: PartSelectorProps) {
  const [parts, setParts] = useState<CarPart[]>([])
  const [selectedPart, setSelectedPart] = useState<CarPart | null>(null)
  const [detectionMethod, setDetectionMethod] = useState<'geometry' | 'metadata' | 'ai'>('geometry')
  const [isDetecting, setIsDetecting] = useState(false)
  const [hiddenParts, setHiddenParts] = useState<Set<string>>(new Set())

  // Detect parts when geometry loads
  useEffect(() => {
    if (!geometry) return
    detectParts()
  }, [geometry, detectionMethod])

  const detectParts = async () => {
    if (!geometry) return
    
    setIsDetecting(true)
    try {
      const detector = new PartDetector(geometry)
      let detectedParts: CarPart[] = []
      
      switch (detectionMethod) {
        case 'geometry':
          detectedParts = detector.detectByGeometry()
          break
        case 'metadata':
          if (loadedModel) {
            detectedParts = detector.detectFromMetadata(loadedModel)
          }
          break
        case 'ai':
          detectedParts = await detector.detectWithAI()
          break
      }
      
      setParts(detectedParts)
    } catch {
      // Detection failed silently
    } finally {
      setIsDetecting(false)
    }
  }

  const handlePartClick = (part: CarPart) => {
    setSelectedPart(part)
    onPartSelect?.(part)
    
    // Highlight the part
    if (onPartHighlight && part.color) {
      onPartHighlight(part.id, new THREE.Color(part.color))
    }
  }

  const togglePartVisibility = (partId: string) => {
    const newHidden = new Set(hiddenParts)
    if (newHidden.has(partId)) {
      newHidden.delete(partId)
    } else {
      newHidden.add(partId)
    }
    setHiddenParts(newHidden)
  }

  const getPartIcon = (type: CarPart['type']) => {
    const icons: Record<CarPart['type'], string> = {
      wheel: '🛞',
      door: '🚪',
      hood: '🏎️',
      roof: '🏠',
      bumper: '🔰',
      window: '🪟',
      mirror: '🪞',
      other: '📦'
    }
    return icons[type] || '📦'
  }

  return (
    <div className="space-y-3">
      {/* Detection Method Selector */}
      <div>
        <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">
          Detection Method
        </label>
        <div className="flex gap-1 p-1 bg-white/5 border border-white/10">
          <button
            onClick={() => setDetectionMethod('geometry')}
            className={`flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wide transition-all ${
              detectionMethod === 'geometry'
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Geometric
          </button>
          <button
            onClick={() => setDetectionMethod('metadata')}
            className={`flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wide transition-all ${
              detectionMethod === 'metadata'
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Metadata
          </button>
          <button
            onClick={() => setDetectionMethod('ai')}
            className={`flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wide transition-all flex items-center justify-center gap-1 ${
              detectionMethod === 'ai'
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            AI
          </button>
        </div>
      </div>

      {/* Detect Button */}
      <button
        onClick={detectParts}
        disabled={!geometry || isDetecting}
        className="w-full py-2 bg-white text-black text-xs font-light uppercase tracking-wide hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDetecting ? 'Detecting Parts...' : 'Detect Parts'}
      </button>

      {/* Parts List */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
          Detected Parts ({parts.length})
        </div>
        
        <AnimatePresence>
          {parts.map((part) => (
            <motion.div
              key={part.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center justify-between p-2 border transition-all cursor-pointer ${
                selectedPart?.id === part.id
                  ? 'bg-white/10 border-white/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
              onClick={() => handlePartClick(part)}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm">{getPartIcon(part.type)}</span>
                <div>
                  <div className="text-xs font-light text-white">{part.name}</div>
                  <div className="text-[10px] text-gray-400 uppercase">
                    {part.type}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Color indicator */}
                {part.color && (
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: part.color }}
                  />
                )}
                
                {/* Hide/Show toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePartVisibility(part.id)
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {hiddenParts.has(part.id) ? (
                    <EyeOff className="w-3 h-3 text-gray-500" />
                  ) : (
                    <Eye className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {parts.length === 0 && !isDetecting && (
          <div className="text-center py-8 text-xs text-gray-500">
            <Box className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No parts detected yet.
            <br />
            Click "Detect Parts" to analyze the model.
          </div>
        )}
      </div>

      {/* Selected Part Details */}
      {selectedPart && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white/5 border border-white/10"
        >
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
            Selected Part
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-white">{selectedPart.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white capitalize">{selectedPart.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Vertices:</span>
              <span className="text-white">{selectedPart.vertices.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Center:</span>
              <span className="text-white text-[10px]">
                ({selectedPart.center.x.toFixed(2)}, {selectedPart.center.y.toFixed(2)}, {selectedPart.center.z.toFixed(2)})
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
