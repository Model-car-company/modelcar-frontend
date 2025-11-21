'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Settings, Wand2, Wrench } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import GenerationPanel from '../../components/studio/GenerationPanel'
import CustomizePanel from '../../components/studio/CustomizePanel'
import MaterialPanel from '../../components/studio/MaterialPanel'
import ExportPanel from '../../components/studio/ExportPanel'

// Dynamic import to avoid SSR issues with Three.js
const Studio3DViewer = dynamic(() => import('../../components/Studio3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-400">Loading 3D Viewer...</p>
      </div>
    </div>
  ),
})

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'customize' | 'material' | 'export'>('generate')
  const [currentModel, setCurrentModel] = useState<string>('')
  const [showGrid, setShowGrid] = useState(true)
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'normal' | 'uv'>('solid')
  const [material, setMaterial] = useState({
    metalness: 0.7,
    roughness: 0.3,
    color: '#808080',
    wireframe: false,
  })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-60 transition-opacity">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-light">Back to Home</span>
            </Link>
            
            <h1 className="text-xl font-thin tracking-[0.2em]">3D STUDIO</h1>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/5 rounded transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 h-screen flex">
        {/* Left Panel - Controls */}
        <div className="w-80 border-r border-white/5 bg-black/30 p-6 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-white/5 rounded-lg">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-light ${
                activeTab === 'generate'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Wand2 className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Generate</span>
            </button>
            <button
              onClick={() => setActiveTab('customize')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-light ${
                activeTab === 'customize'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Wrench className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Customize</span>
            </button>
            <button
              onClick={() => setActiveTab('material')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-light ${
                activeTab === 'material'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Settings className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Material</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-light ${
                activeTab === 'export'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Download className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Export</span>
            </button>
          </div>

          {/* Panel Content */}
          <div>
            {activeTab === 'generate' && (
              <GenerationPanel onGenerate={(modelUrl) => setCurrentModel(modelUrl)} />
            )}
            {activeTab === 'customize' && (
              <CustomizePanel />
            )}
            {activeTab === 'material' && (
              <MaterialPanel
                material={material}
                viewMode={viewMode}
                showGrid={showGrid}
                onMaterialChange={setMaterial}
                onViewModeChange={setViewMode}
                onGridToggle={setShowGrid}
              />
            )}
            {activeTab === 'export' && (
              <ExportPanel modelUrl={currentModel} />
            )}
          </div>
        </div>

        {/* Right Panel - 3D Viewer */}
        <div className="flex-1 relative">
          <Studio3DViewer
            showGrid={showGrid}
            viewMode={viewMode}
            material={material}
            modelUrl={currentModel || '/models/gta-pegassi-zentorno.stl'}
          />
          
          {/* View Controls Overlay */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-3">
            <div className="text-xs font-light text-gray-400 mb-2">View Mode</div>
            <div className="flex gap-2">
              {['solid', 'wireframe', 'normal', 'uv'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-2 py-1 text-xs rounded ${
                    viewMode === mode
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Status Bar with Grid Toggle */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
            <div className="flex items-center gap-4 text-xs font-light text-gray-400">
              <span>Ready</span>
              <span className="w-px h-4 bg-white/10" />
              <span>{currentModel ? 'Model Loaded' : 'No Model'}</span>
              <span className="w-px h-4 bg-white/10" />
              <button
                onClick={() => setShowGrid(!showGrid)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Grid: {showGrid ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
