'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Wand2, Wrench, Maximize2, Minimize2, Move, Layers, Target, ZoomIn, ZoomOut,
  ChevronDown, ChevronUp, Box, Loader2, Check
} from 'lucide-react'

// Unit conversion constants (assuming 1 unit = 1 meter for GLB/glTF)
const METERS_TO_INCHES = 39.3701
const METERS_TO_CM = 100

interface MeshStats {
  vertexCount: number
  triangleCount: number
  boundingBox: { size: { x: number; y: number; z: number } } | null
}

interface UserModel {
  id: string
  name: string
  thumbnail: string | null
  url: string
  created_at: string
}

interface CustomizePanelProps {
  onSmooth?: (strength: number) => void
  onRepair?: () => void
  onScale?: (scale: number | { x: number; y: number; z: number }) => void
  onDecimate?: (ratio: number) => void
  onSubdivide?: (levels: number) => void
  onCenter?: () => void
  onLoadModel?: (model: UserModel) => void
  onSaveModel?: () => void
  meshStats?: MeshStats | null
  isProcessing?: boolean
  userModels?: UserModel[]
  loadingModels?: boolean
  currentModelId?: string | null
  hasUnsavedChanges?: boolean
  isSaving?: boolean
}

export default function CustomizePanel({ 
  onSmooth, 
  onRepair,
  onScale,
  onDecimate,
  onSubdivide,
  onCenter,
  onLoadModel,
  onSaveModel,
  meshStats,
  isProcessing = false,
  userModels = [],
  loadingModels = false,
  currentModelId = null,
  hasUnsavedChanges = false,
  isSaving = false
}: CustomizePanelProps) {
  const [smoothStrength, setSmoothStrength] = useState(50)
  const [scaleValue, setScaleValue] = useState(100)
  const [scaleX, setScaleX] = useState(100)
  const [scaleY, setScaleY] = useState(100)
  const [scaleZ, setScaleZ] = useState(100)
  const [uniformScale, setUniformScale] = useState(true)
  const [decimateRatio, setDecimateRatio] = useState(50)
  const [subdivideLevel, setSubdivideLevel] = useState(1)
  const [expandedSections, setExpandedSections] = useState({
    models: true,
    transform: true,
    mesh: false,
    optimize: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleScaleApply = () => {
    if (uniformScale) {
      onScale?.(scaleValue / 100)
    } else {
      onScale?.({ x: scaleX / 100, y: scaleY / 100, z: scaleZ / 100 })
    }
  }

  const handleQuickScale = (factor: number) => {
    onScale?.(factor)
    setScaleValue(factor * 100)
  }

  // Convert size to inches and cm
  const formatSize = (meters: number) => {
    const inches = meters * METERS_TO_INCHES
    const cm = meters * METERS_TO_CM
    return { inches: inches.toFixed(2), cm: cm.toFixed(2) }
  }

  // Get all user's 3D models
  const recentModels = userModels

  return (
    <div className="space-y-3">
      {/* My Models Section */}
      <div className="border border-white/10">
        <button
          onClick={() => toggleSection('models')}
          className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Box className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-light text-white">My Models</span>
            {hasUnsavedChanges && (
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Unsaved changes" />
            )}
          </div>
          {expandedSections.models ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
        </button>
        
        {expandedSections.models && (
          <div className="p-3 space-y-3">
            {loadingModels ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : recentModels.length === 0 ? (
              <p className="text-[10px] text-gray-500 text-center py-2">
                No 3D models yet. Create one in the Design page.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {recentModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => onLoadModel?.(model)}
                    disabled={isProcessing}
                    className={`w-full flex items-center gap-3 p-2 border transition-all ${
                      currentModelId === model.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    } disabled:opacity-50`}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
                      {model.thumbnail ? (
                        <img 
                          src={model.thumbnail} 
                          alt={model.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[10px] text-white truncate">{model.name}</p>
                      <p className="text-[9px] text-gray-500">
                        {new Date(model.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Selected indicator */}
                    {currentModelId === model.id && (
                      <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Save Button */}
            {currentModelId && hasUnsavedChanges && (
              <button
                onClick={() => onSaveModel?.()}
                disabled={isSaving || isProcessing}
                className="w-full px-3 py-2 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-light hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Model Stats with Real Dimensions */}
      {meshStats && (
        <div className="p-3 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Model Info</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Vertices</span>
              <span className="text-white font-light">{meshStats.vertexCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Triangles</span>
              <span className="text-white font-light">{meshStats.triangleCount.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Real-world dimensions */}
          {meshStats.boundingBox && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Dimensions</div>
              
              {/* Inches */}
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <div className="bg-white/5 p-1.5 text-center">
                  <span className="text-red-400">W</span>
                  <span className="text-white ml-1">{formatSize(meshStats.boundingBox.size.x).inches}"</span>
                </div>
                <div className="bg-white/5 p-1.5 text-center">
                  <span className="text-green-400">H</span>
                  <span className="text-white ml-1">{formatSize(meshStats.boundingBox.size.y).inches}"</span>
                </div>
                <div className="bg-white/5 p-1.5 text-center">
                  <span className="text-blue-400">D</span>
                  <span className="text-white ml-1">{formatSize(meshStats.boundingBox.size.z).inches}"</span>
                </div>
              </div>
              
              {/* Centimeters */}
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <div className="bg-white/5 p-1.5 text-center">
                  <span className="text-white">{formatSize(meshStats.boundingBox.size.x).cm}</span>
                  <span className="text-gray-500 ml-0.5">cm</span>
                </div>
                <div className="bg-white/5 p-1.5 text-center">
                  <span className="text-white">{formatSize(meshStats.boundingBox.size.y).cm}</span>
                  <span className="text-gray-500 ml-0.5">cm</span>
                </div>
                <div className="bg-white/5 p-1.5 text-center">
                  <span className="text-white">{formatSize(meshStats.boundingBox.size.z).cm}</span>
                  <span className="text-gray-500 ml-0.5">cm</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transform Section - COMMENTED OUT (using interactive gizmo instead)
      <div className="border border-white/10">
        <button
          onClick={() => toggleSection('transform')}
          className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Move className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-light text-white">Transform</span>
          </div>
          {expandedSections.transform ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
        </button>
        
        {expandedSections.transform && (
          <div className="p-3 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setUniformScale(true)}
                className={`flex-1 px-2 py-1.5 text-[10px] border transition-all ${
                  uniformScale 
                    ? 'bg-white text-black border-white' 
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                Uniform
              </button>
              <button
                onClick={() => setUniformScale(false)}
                className={`flex-1 px-2 py-1.5 text-[10px] border transition-all ${
                  !uniformScale 
                    ? 'bg-white text-black border-white' 
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                Per Axis
              </button>
            </div>
            
            {uniformScale ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">Scale</label>
                  <span className="text-xs text-white">{scaleValue}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={scaleValue}
                  onChange={(e) => setScaleValue(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                {meshStats?.boundingBox && (
                  <div className="mt-2 text-[9px] text-gray-500">
                    After: {formatSize(meshStats.boundingBox.size.x * scaleValue / 100).inches}" × {formatSize(meshStats.boundingBox.size.y * scaleValue / 100).inches}" × {formatSize(meshStats.boundingBox.size.z * scaleValue / 100).inches}"
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  { label: 'X', value: scaleX, setter: setScaleX, color: 'text-red-400', dim: 'x' },
                  { label: 'Y', value: scaleY, setter: setScaleY, color: 'text-green-400', dim: 'y' },
                  { label: 'Z', value: scaleZ, setter: setScaleZ, color: 'text-blue-400', dim: 'z' },
                ].map(({ label, value, setter, color, dim }) => (
                  <div key={label}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${color} w-3`}>{label}</span>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        value={value}
                        onChange={(e) => setter(Number(e.target.value))}
                        className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] text-white w-8 text-right">{value}%</span>
                    </div>
                    {meshStats?.boundingBox && (
                      <div className="text-[8px] text-gray-600 ml-5">
                        {formatSize(meshStats.boundingBox.size[dim as 'x'|'y'|'z'] * value / 100).inches}" / {formatSize(meshStats.boundingBox.size[dim as 'x'|'y'|'z'] * value / 100).cm}cm
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-1">
              <button
                onClick={() => handleQuickScale(0.5)}
                disabled={isProcessing}
                className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 text-[10px] text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                <Minimize2 className="w-3 h-3 mx-auto" />
              </button>
              <button
                onClick={handleScaleApply}
                disabled={isProcessing}
                className="flex-[2] px-2 py-1.5 bg-white text-black text-[10px] font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Apply Scale
              </button>
              <button
                onClick={() => handleQuickScale(2)}
                disabled={isProcessing}
                className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 text-[10px] text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                <Maximize2 className="w-3 h-3 mx-auto" />
              </button>
            </div>
            
            <button
              onClick={() => onCenter?.()}
              disabled={isProcessing}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-xs font-light text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Target className="w-3 h-3" />
              Center at Origin
            </button>
          </div>
        )}
      </div>
      */}

      {/* Mesh Tools Section */}
      <div className="border border-white/10">
        <button
          onClick={() => toggleSection('mesh')}
          className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wand2 className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-light text-white">Mesh Tools</span>
          </div>
          {expandedSections.mesh ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
        </button>
        
        {expandedSections.mesh && (
          <div className="p-3 space-y-3">
            {/* Smoothing */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Smooth Surface</label>
                <span className="text-xs text-white">{smoothStrength}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={smoothStrength}
                onChange={(e) => setSmoothStrength(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => onSmooth?.(smoothStrength)}
                disabled={isProcessing}
                className="w-full mt-2 px-3 py-2 bg-white text-black text-xs font-light hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Apply Smoothing
              </button>
            </div>

            {/* Repair */}
            <button
              onClick={() => onRepair?.()}
              disabled={isProcessing}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-xs font-light text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wrench className="w-3 h-3" />
              Repair Mesh
            </button>
          </div>
        )}
      </div>

      {/* Optimize Section */}
      <div className="border border-white/10">
        <button
          onClick={() => toggleSection('optimize')}
          className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-light text-white">Optimize</span>
          </div>
          {expandedSections.optimize ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
        </button>
        
        {expandedSections.optimize && (
          <div className="p-3 space-y-3">
            {/* Decimate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Reduce Polygons</label>
                <span className="text-xs text-white">{decimateRatio}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={decimateRatio}
                onChange={(e) => setDecimateRatio(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[9px] text-gray-500 mt-1">
                Keep {decimateRatio}% of triangles ({meshStats ? Math.floor(meshStats.triangleCount * decimateRatio / 100).toLocaleString() : '—'} remaining)
              </p>
              <button
                onClick={() => onDecimate?.(decimateRatio / 100)}
                disabled={isProcessing}
                className="w-full mt-2 px-3 py-2 bg-white text-black text-xs font-light hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ZoomOut className="w-3 h-3 inline mr-1" />
                Decimate
              </button>
            </div>

            {/* Subdivide */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Add Detail</label>
                <span className="text-xs text-white">Level {subdivideLevel}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSubdivideLevel(level)}
                    className={`flex-1 px-2 py-1.5 text-[10px] border transition-all ${
                      subdivideLevel === level 
                        ? 'bg-white text-black border-white' 
                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {level}x
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-gray-500 mt-1">
                Result: ~{meshStats ? (meshStats.triangleCount * Math.pow(4, subdivideLevel)).toLocaleString() : '—'} triangles
              </p>
              <button
                onClick={() => onSubdivide?.(subdivideLevel)}
                disabled={isProcessing}
                className="w-full mt-2 px-3 py-2 bg-white text-black text-xs font-light hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ZoomIn className="w-3 h-3 inline mr-1" />
                Subdivide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
