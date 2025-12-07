'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, Wrench, Loader2, CheckCircle2, Box, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import { createClient } from '../../lib/supabase/client'
import { smoothMesh, repairMesh, scaleMesh, centerMesh, decimateMesh, subdivideMesh, getMeshStats } from '../../lib/meshUtils'
// GenerationPanel removed - generation is now in /image page
import CustomizePanel from '../../components/studio/CustomizePanel'

// Type for user models
interface UserModel {
  id: string
  name: string
  thumbnail: string | null
  url: string
  created_at: string
}
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
  const assetId = searchParams?.get('asset')
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'customize' | 'export'>('customize')
  const [currentModel, setCurrentModel] = useState<string>('')
  const [currentModelId, setCurrentModelId] = useState<string | null>(null)
  
  // User models state
  const [userModels, setUserModels] = useState<UserModel[]>([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const router = useRouter()
  
  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])
  
  // Handle navigation with unsaved changes warning
  const handleNavigation = useCallback((href: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(href)
      setShowUnsavedWarning(true)
    } else {
      router.push(href)
    }
  }, [hasUnsavedChanges, router])
  
  // Confirm leaving without saving
  const confirmLeave = useCallback(() => {
    setShowUnsavedWarning(false)
    setHasUnsavedChanges(false)
    if (pendingNavigation) {
      router.push(pendingNavigation)
      setPendingNavigation(null)
    }
  }, [pendingNavigation, router])
  
  // Cancel navigation and stay on page
  const cancelLeave = useCallback(() => {
    setShowUnsavedWarning(false)
    setPendingNavigation(null)
  }, [])
  
  // Fetch user's 3D models on mount
  useEffect(() => {
    const fetchUserModels = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoadingModels(false)
          return
        }

        const { data: assets } = await supabase
          .from('user_assets')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'model3d')
          .order('created_at', { ascending: false })

        if (assets) {
          const models: UserModel[] = assets.map(asset => ({
            id: asset.id,
            name: asset.prompt || 'Untitled Model',
            thumbnail: asset.thumbnail_url || null,
            url: asset.url,
            created_at: asset.created_at
          }))
          setUserModels(models)
        }
      } catch (error) {
      } finally {
        setLoadingModels(false)
      }
    }

    fetchUserModels()
  }, [supabase])
  
  // Use proxy URL when asset ID is provided - this avoids CORS issues
  // and keeps external provider URLs hidden from the client
  useEffect(() => {
    if (assetId) {
      // Use our API proxy which fetches the model server-side
      setCurrentModel(`/api/models/${assetId}`)
      setCurrentModelId(assetId)
    }
  }, [assetId])

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
      setHasUnsavedChanges(true)
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
      setHasUnsavedChanges(true)
      showToast('Mesh repaired successfully!')
    } catch (error) {
      showToast('Repair failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [currentGeometry, addToHistory, showToast])

  // Handle scale operation
  const handleScale = useCallback(async (scale: number | { x: number; y: number; z: number }) => {
    if (!currentGeometry) {
      showToast('No model loaded', 'error')
      return
    }
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const scaled = scaleMesh(currentGeometry, scale)
      
      if (!scaled || !scaled.getAttribute('position')) {
        throw new Error('Scaling produced invalid geometry')
      }
      
      addToHistory(scaled)
      setHasUnsavedChanges(true)
      const scaleLabel = typeof scale === 'number' 
        ? `${(scale * 100).toFixed(0)}%` 
        : `X:${(scale.x * 100).toFixed(0)}% Y:${(scale.y * 100).toFixed(0)}% Z:${(scale.z * 100).toFixed(0)}%`
      showToast(`Scaled to ${scaleLabel}`)
    } catch (error) {
      showToast('Scale failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [currentGeometry, addToHistory, showToast])

  // Handle decimate operation
  const handleDecimate = useCallback(async (ratio: number) => {
    if (!currentGeometry) {
      showToast('No model loaded', 'error')
      return
    }
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const decimated = decimateMesh(currentGeometry, ratio)
      
      if (!decimated || !decimated.getAttribute('position')) {
        throw new Error('Decimation produced invalid geometry')
      }
      
      addToHistory(decimated)
      setHasUnsavedChanges(true)
      showToast(`Reduced to ${(ratio * 100).toFixed(0)}% polygons`)
    } catch (error) {
      showToast('Decimation failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [currentGeometry, addToHistory, showToast])

  // Handle subdivide operation
  const handleSubdivide = useCallback(async (levels: number) => {
    if (!currentGeometry) {
      showToast('No model loaded', 'error')
      return
    }
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const subdivided = subdivideMesh(currentGeometry, levels)
      
      if (!subdivided || !subdivided.getAttribute('position')) {
        throw new Error('Subdivision produced invalid geometry')
      }
      
      addToHistory(subdivided)
      setHasUnsavedChanges(true)
      showToast(`Subdivided ${levels}x`)
    } catch (error) {
      showToast('Subdivision failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [currentGeometry, addToHistory, showToast])

  // Handle center operation
  const handleCenter = useCallback(async () => {
    if (!currentGeometry) {
      showToast('No model loaded', 'error')
      return
    }
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const centered = centerMesh(currentGeometry)
      
      if (!centered || !centered.getAttribute('position')) {
        throw new Error('Centering produced invalid geometry')
      }
      
      addToHistory(centered)
      setHasUnsavedChanges(true)
      showToast('Centered at origin')
    } catch (error) {
      showToast('Center failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [currentGeometry, addToHistory, showToast])

  // Handle scale change from interactive gizmo (real-time scaling in 3D viewport)
  const handleGizmoScaleChange = useCallback((scale: { x: number; y: number; z: number }) => {
    if (!currentGeometry) return
    
    // Apply the scale change to the geometry
    const scaled = scaleMesh(currentGeometry, scale)
    
    if (scaled && scaled.getAttribute('position')) {
      addToHistory(scaled)
      setHasUnsavedChanges(true)
      
      const scaleLabel = `X:${(scale.x * 100).toFixed(0)}% Y:${(scale.y * 100).toFixed(0)}% Z:${(scale.z * 100).toFixed(0)}%`
      showToast(`Scaled: ${scaleLabel}`)
    }
  }, [currentGeometry, addToHistory, showToast])

  // Handle loading a model from user's library
  const handleLoadModel = useCallback((model: UserModel) => {
    setCurrentModel(`/api/models/${model.id}`)
    setCurrentModelId(model.id)
    setHasUnsavedChanges(false)
    setGeometryHistory([])
    setHistoryIndex(-1)
    setCurrentGeometry(null)
    showToast(`Loaded: ${model.name}`)
  }, [showToast])

  // Handle saving model changes to Supabase
  const handleSaveModel = useCallback(async () => {
    if (!currentModelId || !currentGeometry) {
      showToast('No model to save', 'error')
      return
    }
    
    setIsSaving(true)
    
    try {
      // Export geometry to GLB format
      const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js')
      const exporter = new GLTFExporter()
      
      // Create a mesh from the geometry for export
      const mesh = new THREE.Mesh(
        currentGeometry,
        new THREE.MeshStandardMaterial({ color: 0x808080 })
      )
      
      const glb = await new Promise<ArrayBuffer>((resolve, reject) => {
        exporter.parse(
          mesh,
          (result) => resolve(result as ArrayBuffer),
          (error) => reject(error),
          { binary: true }
        )
      })
      
      // Upload to API which will handle Supabase update
      const formData = new FormData()
      formData.append('file', new Blob([glb], { type: 'model/gltf-binary' }), 'model.glb')
      formData.append('assetId', currentModelId)
      
      const response = await fetch('/api/models/save', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to save model')
      }
      
      setHasUnsavedChanges(false)
      showToast('Model saved successfully!')
    } catch (error) {
      showToast('Failed to save model', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [currentModelId, currentGeometry, showToast])

  // Get current mesh stats
  const meshStats = currentGeometry ? getMeshStats(currentGeometry) : null

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      {/* Main Content */}
      <div className="h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Controls */}
        <div className="w-full lg:w-80 border-b lg:border-r lg:border-b-0 border-white/5 bg-black/30 p-4 lg:p-6 overflow-y-auto max-h-screen">
          {/* Back to Dashboard */}
          <button 
            onClick={() => handleNavigation('/dashboard')} 
            className="flex items-center gap-2 mb-4 lg:mb-6 text-xs font-light text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Dashboard</span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Unsaved changes" />
            )}
          </button>

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
                onScale={handleScale}
                onDecimate={handleDecimate}
                onSubdivide={handleSubdivide}
                onCenter={handleCenter}
                onLoadModel={handleLoadModel}
                onSaveModel={handleSaveModel}
                meshStats={meshStats ? {
                  vertexCount: meshStats.vertexCount,
                  triangleCount: meshStats.triangleCount,
                  boundingBox: meshStats.boundingBox ? {
                    size: {
                      x: meshStats.boundingBox.size.x,
                      y: meshStats.boundingBox.size.y,
                      z: meshStats.boundingBox.size.z
                    }
                  } : null
                } : null}
                isProcessing={isProcessing}
                userModels={userModels}
                loadingModels={loadingModels}
                currentModelId={currentModelId}
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
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
              <ExportPanel modelUrl={currentModel} geometry={currentGeometry} />
            )}
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 relative bg-gradient-to-br from-black via-gray-900 to-black h-screen overflow-hidden">
          {currentModel ? (
            <EditableStudio3DViewer
              showGrid={showGrid}
              viewMode={viewMode}
              material={material}
              modelUrl={currentModel}
              geometry={currentGeometry}
              onGeometryUpdate={handleGeometryLoaded}
              onScaleChange={handleGizmoScaleChange}
              meshStats={meshStats}
              // WIND TUNNEL PROPS COMMENTED OUT
              // windSpeed={windSpeed}
              // showStreamlines={showStreamlines}
            />
          ) : (
            /* Empty State - No Model Selected */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md px-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <Box className="w-10 h-10 text-gray-600" />
                </div>
                <h2 className="text-xl font-light text-white mb-2">No Model Selected</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Select a 3D model from your library to start editing. You can scale, smooth, and customize your designs.
                </p>
                <div className="flex flex-col gap-2 text-xs text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500/50 rounded-full"></span>
                    <span>Select from "My Models" panel</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-blue-500/50 rounded-full"></span>
                    <span>Or create new designs in the Design page</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          
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
          
          {/* View Mode Section - COMMENTED OUT */}
          {/* <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-3">
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
          </div> */}

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
          
          {/* Floating Save Button - Bottom Right when unsaved changes */}
          <AnimatePresence>
            {hasUnsavedChanges && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={handleSaveModel}
                disabled={isSaving}
                className="absolute bottom-4 right-4 px-4 py-1.5 bg-white text-black text-xs font-light tracking-wide hover:bg-gray-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Save
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Unsaved Changes Warning Modal */}
      <AnimatePresence>
        {showUnsavedWarning && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelLeave}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-black border border-white/10 w-full max-w-md relative overflow-hidden"
              >
                {/* Content */}
                <div className="p-8">
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-thin tracking-tight mb-3 text-center">
                    Unsaved Changes
                  </h2>

                  {/* Message */}
                  <p className="text-sm font-light text-gray-400 text-center mb-8">
                    You have unsaved changes to your 3D model. If you leave now, your changes will be lost.
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={async () => {
                        setShowUnsavedWarning(false)
                        await handleSaveModel()
                        if (pendingNavigation) {
                          router.push(pendingNavigation)
                          setPendingNavigation(null)
                        }
                      }}
                      disabled={isSaving}
                      className="w-full py-2.5 px-4 text-sm bg-gradient-to-br from-emerald-500/70 via-emerald-600/60 to-emerald-500/70 border border-emerald-500/40 text-white font-light tracking-wide hover:from-emerald-500/90 hover:via-emerald-600/80 hover:to-emerald-500/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Save Changes & Leave
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={confirmLeave}
                      className="w-full py-2.5 px-4 text-sm bg-gradient-to-br from-red-500/70 via-red-600/60 to-red-500/70 border border-red-500/40 text-white font-light tracking-wide hover:from-red-500/90 hover:via-red-600/80 hover:to-red-500/90 transition-all"
                    >
                      Leave Without Saving
                    </button>
                    
                    <button
                      onClick={cancelLeave}
                      className="w-full py-2.5 px-4 text-sm bg-white/5 border border-white/10 text-gray-300 font-light tracking-wide hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
