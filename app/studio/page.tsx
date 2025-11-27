'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, Wrench, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import { smoothMesh, repairMesh } from '../../lib/meshUtils'
// GenerationPanel removed - generation is now in /image page
import CustomizePanel from '../../components/studio/CustomizePanel'
import ExportPanel from '../../components/studio/ExportPanel'
// WIND TUNNEL COMMENTED OUT
// import { Wind } from 'lucide-react'
// import WindTunnelPanel from '../../components/studio/WindTunnelPanel'

// Dynamic import to avoid SSR issues with Three.js
const EditableStudio3DViewer = dynamic(() => import('../../components/studio/EditableStudio3DViewer'), {
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
  const searchParams = useSearchParams()
  const modelFromUrl = searchParams?.get('model')

  const [activeTab, setActiveTab] = useState<'customize' | 'export'>('customize')
  const [currentModel, setCurrentModel] = useState<string>(modelFromUrl || '')
  
  // Update model if URL param changes
  useEffect(() => {
    if (modelFromUrl) {
      setCurrentModel(modelFromUrl)
    }
  }, [modelFromUrl])

  const [showGrid, setShowGrid] = useState(true)
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'normal' | 'uv'>('solid')
  const [material, setMaterial] = useState({
    metalness: 0.7,
    roughness: 0.3,
    color: '#808080',
    wireframe: false,
  })
  
  // Geometry state for mesh operations
  const [currentGeometry, setCurrentGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [geometryHistory, setGeometryHistory] = useState<THREE.BufferGeometry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Loading and feedback state
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Wind Tunnel state (COMMENTED OUT)
  // const [windSpeed, setWindSpeed] = useState(120)
  // const [windAngle, setWindAngle] = useState(0)
  // const [showStreamlines, setShowStreamlines] = useState(false)
  // const [showPressure, setShowPressure] = useState(false)
  // const [showVortices, setShowVortices] = useState(false)
  
  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])
  
  // Handle geometry update from viewer
  const handleGeometryLoaded = useCallback((geometry: THREE.BufferGeometry) => {
    const cloned = geometry.clone()
    setCurrentGeometry(cloned)
    setGeometryHistory([cloned])
    setHistoryIndex(0)
  }, [])
  
  // Add to history
  const addToHistory = useCallback((geometry: THREE.BufferGeometry) => {
    
    const newHistory = geometryHistory.slice(0, historyIndex + 1)
    const clonedGeometry = geometry.clone()
    newHistory.push(clonedGeometry)
    
    setGeometryHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setCurrentGeometry(clonedGeometry)
  }, [geometryHistory, historyIndex])
  
  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCurrentGeometry(geometryHistory[newIndex].clone())
      showToast('Undo successful')
    }
  }, [historyIndex, geometryHistory, showToast])
  
  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < geometryHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCurrentGeometry(geometryHistory[newIndex].clone())
      showToast('Redo successful')
    }
  }, [historyIndex, geometryHistory, showToast])
  
  // Handle smooth operation
  const handleSmooth = useCallback(async (strength: number) => {
    if (!currentGeometry) {
      showToast('No model loaded', 'error')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Give UI time to show loading overlay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const smoothed = smoothMesh(currentGeometry, strength, 2)
      
      if (!smoothed || !smoothed.getAttribute('position')) {
        throw new Error('Smoothing produced invalid geometry')
      }
      
      addToHistory(smoothed)
      showToast(`Smoothing applied (${strength}%)`)
    } catch (error) {
      showToast('Smoothing failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [currentGeometry, addToHistory, showToast])
  
  // Handle repair operation
  const handleRepair = useCallback(async () => {
    if (!currentGeometry) {
      showToast('No model loaded', 'error')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Process in next frame to allow UI update
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const repaired = await repairMesh(currentGeometry)
      
      if (!repaired || !repaired.getAttribute('position')) {
        throw new Error('Repair produced invalid geometry')
      }
      
      addToHistory(repaired)
      showToast('Mesh repaired successfully!')
    } catch (error) {
      showToast('Repair failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [currentGeometry, addToHistory, showToast])

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      {/* Main Content */}
      <div className="h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Controls */}
        <div className="w-full lg:w-80 border-b lg:border-r lg:border-b-0 border-white/5 bg-black/30 p-4 lg:p-6 overflow-y-auto max-h-screen">
          {/* Back to Dashboard */}
          <Link href="/dashboard" className="flex items-center gap-2 mb-4 lg:mb-6 text-xs font-light text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-2 mb-4 lg:mb-6 p-1 bg-white/5 rounded-lg">
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
            {/* WIND TUNNEL COMMENTED OUT */}
            {/* <button
              onClick={() => {
                setActiveTab('windtunnel')
                setViewMode('windtunnel')
              }}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-light ${
                activeTab === 'windtunnel'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Wind className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Wind Tunnel</span>
            </button> */}
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
            {activeTab === 'customize' && (
              <CustomizePanel 
                onSmooth={handleSmooth}
                onRepair={handleRepair}
              />
            )}
            {/* WIND TUNNEL PANEL COMMENTED OUT */}
            {/* {activeTab === 'windtunnel' && (
              <WindTunnelPanel
                windSpeed={windSpeed}
                windAngle={windAngle}
                showStreamlines={showStreamlines}
                showPressure={showPressure}
                showVortices={showVortices}
                onWindSpeedChange={setWindSpeed}
                onWindAngleChange={setWindAngle}
                onStreamlinesToggle={setShowStreamlines}
                onPressureToggle={setShowPressure}
                onVorticesToggle={setShowVortices}
            )} */}
            {activeTab === 'export' && (
              <ExportPanel modelUrl={currentModel} />
            )}
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 relative bg-gradient-to-br from-black via-gray-900 to-black h-screen overflow-hidden">
          <EditableStudio3DViewer
            showGrid={showGrid}
            viewMode={viewMode}
            material={material}
            modelUrl={currentModel || '/models/gta-pegassi-zentorno.stl'}
            geometry={currentGeometry}
            onGeometryUpdate={handleGeometryLoaded}
            // WIND TUNNEL PROPS COMMENTED OUT
            // windSpeed={windSpeed}
            // showStreamlines={showStreamlines}
          />
          
          
          {/* Processing Overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20"
              >
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
                  <p className="text-sm text-white font-light">Processing mesh...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute top-4 right-4 z-30 px-4 py-3 rounded-lg backdrop-blur-sm border flex items-center gap-3 ${
                  toast.type === 'success' 
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'bg-red-500/20 border-red-500/50 text-red-400'
                }`}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {toast.type === 'error' && <Wrench className="w-4 h-4" />}
                <span className="text-sm font-light">{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
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
