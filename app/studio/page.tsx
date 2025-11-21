'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wand2, Download, Upload, Settings, Grid3x3, Layers, 
  Sparkles, Box, Palette, Sun, Camera, Move3d,
  RotateCw, ZoomIn, Eye, Gauge, Package,
  ArrowLeft, RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamic imports
const Studio3DViewer = dynamic(() => import('../../components/Studio3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="w-16 h-16 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )
})

// Temporarily disabled panel imports to fix loading issues
// const GenerationPanel = dynamic(() => import('../../components/studio/GenerationPanel'), { ssr: false })
// const MaterialPanel = dynamic(() => import('../../components/studio/MaterialPanel'), { ssr: false })
// const ExportPanel = dynamic(() => import('../../components/studio/ExportPanel'), { ssr: false })

export default function StudioPage() {
  const [selectedTool, setSelectedTool] = useState<string>('move')
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'normal' | 'uv'>('wireframe')
  const [showGrid, setShowGrid] = useState(true)
  const [showStats, setShowStats] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<'generate' | 'material' | 'export'>('generate')
  
  const [material, setMaterial] = useState({
    metalness: 0.8,
    roughness: 0.2,
    color: '#3b82f6',
    wireframe: false
  })

  const [meshStats] = useState({
    vertices: 520495,
    faces: 1000746,
    triangles: 1000746,
    materials: 3
  })

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-black/80 backdrop-blur-sm border-b border-white/5 z-20">
        <div className="h-full flex items-center justify-between px-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-70">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-light">Back</span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <h1 className="text-sm font-light tracking-wider">3D Studio</h1>
          </div>

          {/* Center Tools */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            {[
              { id: 'move', icon: Move3d },
              { id: 'rotate', icon: RotateCw },
              { id: 'scale', icon: ZoomIn },
              { id: 'camera', icon: Camera },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-2 rounded transition-all ${
                  selectedTool === tool.id 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded hover:bg-white/5 ${showGrid ? 'text-red-400' : 'text-gray-500'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded hover:bg-white/5 text-gray-400"
            >
              <Gauge className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded text-xs">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 pt-14 flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-black/40 backdrop-blur-sm border-r border-white/5">
          <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {[
                { id: 'generate', label: 'Generation', icon: Wand2 },
                { id: 'material', label: 'Material', icon: Palette },
                { id: 'export', label: 'Export', icon: Download }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSidebarTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 text-xs font-light ${
                    sidebarTab === tab.id
                      ? 'bg-white/5 text-white border-b-2 border-red-500'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mx-auto mb-1" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {sidebarTab === 'generate' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xs font-light text-gray-400">Matrix Generation</h3>
                    <div className="space-y-2">
                      <button className="w-full py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded text-xs">
                        Generate 10x10x10 Matrix
                      </button>
                      <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-xs">
                        Generate 20x20x20 Matrix
                      </button>
                    </div>
                  </motion.div>
                )}
                {sidebarTab === 'material' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xs font-light text-gray-400">Matrix Style</h3>
                    <div className="space-y-2">
                      <label className="text-xs">Color</label>
                      <input
                        type="color"
                        value={material.color}
                        onChange={(e) => setMaterial({...material, color: e.target.value})}
                        className="w-full h-8 bg-transparent border border-white/10 rounded"
                      />
                    </div>
                  </motion.div>
                )}
                {sidebarTab === 'export' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xs font-light text-gray-400">Export Matrix</h3>
                    <button className="w-full py-2 bg-white/5 border border-white/10 rounded text-xs">
                      Export as OBJ
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-900/20 to-black">
          {/* Stats Overlay */}
          {showStats && (
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded p-3 z-10">
              <h3 className="text-xs font-light text-gray-400 mb-2">Mesh Statistics</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between gap-8">
                  <span className="text-gray-500">Vertices:</span>
                  <span className="text-red-400">{meshStats.vertices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Faces:</span>
                  <span className="text-red-400">{meshStats.faces.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Triangles:</span>
                  <span className="text-red-400">{meshStats.triangles.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* View Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {[
              { mode: 'solid', icon: Eye },
              { mode: 'wireframe', icon: Grid3x3 },
            ].map(view => (
              <button
                key={view.mode}
                onClick={() => setViewMode(view.mode as any)}
                className={`p-2 rounded backdrop-blur-sm ${
                  viewMode === view.mode
                    ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                    : 'bg-black/50 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <view.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* 3D Viewer */}
          <Studio3DViewer
            showGrid={showGrid}
            viewMode={viewMode}
            material={material}
          />

          {/* Bottom View Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
            <button className="p-1.5 hover:bg-white/10 rounded" title="Reset">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <div className="h-4 w-px bg-white/10" />
            {['F', 'B', 'L', 'R', 'T'].map(view => (
              <button key={view} className="px-2 py-1 text-xs hover:bg-white/10 rounded">
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
