'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import CollapsibleSidebar from '../../components/CollapsibleSidebar'
import OnboardingTour from '../../components/OnboardingTour'
import ConfirmDialog from '../../components/ConfirmDialog'
import ShipDesignModal from '../../components/ShipDesignModal'
import ModelViewer3D from '../../components/ModelViewer3D'
import { Download, Trash2, Eye, Box, Grid3x3, List, Truck, X, Globe, Lock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'

export default function GaragePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<any>(null)
  const [showShipModal, setShowShipModal] = useState(false)
  const [modelToShip, setModelToShip] = useState<any>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [imageToPreview, setImageToPreview] = useState<any>(null)
  const [show3DPreview, setShow3DPreview] = useState(false)
  const [model3DToPreview, setModel3DToPreview] = useState<any>(null)

  useEffect(() => {
    loadUserData()
  }, [router, supabase])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/sign-in')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Load user's assets from database
      const { data: assets, error } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (assets) {
        // Transform assets to model format
        const transformedModels = assets.map(asset => ({
          id: asset.id,
          name: asset.prompt || 'Untitled',
          thumbnail: asset.thumbnail_url || asset.url,
          created_at: asset.created_at,
          file_size: '-', // TODO: Add file size to assets
          format: asset.format?.toUpperCase() || (asset.type === 'image' ? 'IMAGE' : 'MODEL'),
          polygons: '-', // TODO: Add polygon count
          url: asset.url,
          type: asset.type,
          is_public: asset.is_public || false
        }))

        setModels(transformedModels)
      }
      setLoading(false)

    } catch (error: any) {
      toast.error('Failed to load garage')
      setLoading(false)
    }
  }

  const handleDeleteClick = (model: any) => {
    setModelToDelete(model)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!modelToDelete) return

    // Delete from database
    const { error } = await supabase
      .from('user_assets')
      .delete()
      .eq('id', modelToDelete.id)

    if (error) {
      toast.error('Failed to delete model', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
          fontWeight: '300',
        },
      })
      return
    }

    toast.success('Model deleted', {
      style: {
        background: '#0a0a0a',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '12px',
        fontWeight: '300',
      },
    })

    setModels(models.filter(m => m.id !== modelToDelete.id))
    setModelToDelete(null)
  }

  const handleDownload = async (model: any) => {
    try {
      toast.loading(`Downloading ${model.name}...`, { id: 'download' })

      // Fetch the file
      const response = await fetch(model.url)
      if (!response.ok) throw new Error('Failed to fetch file')

      const blob = await response.blob()

      // Determine filename and extension
      const isModel = model.type === 'model3d'
      const extension = isModel ? '.glb' : '.jpg'
      const sanitizedName = (model.name || 'download').replace(/[^a-zA-Z0-9-_]/g, '_')
      const filename = `${sanitizedName}${extension}`

      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Downloaded ${filename}`, {
        id: 'download',
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
          fontWeight: '300',
        },
      })
    } catch (error) {
      toast.error('Failed to download file', { id: 'download' })
    }
  }

  const handleShipClick = (model: any) => {
    setModelToShip(model)
    setShowShipModal(true)
  }

  const handleView = (model: any) => {
    if (model.type === 'model3d') {
      // Navigate to Studio for 3D models
      router.push(`/studio?asset=${model.id}`)
    } else {
      // Open image preview modal for images
      setImageToPreview(model)
      setShowImagePreview(true)
    }
  }

  const handle3DPreview = (model: any) => {
    if (!model || model.type !== 'model3d') return
    setModel3DToPreview(model)
    setShow3DPreview(true)
  }

  const togglePublic = async (modelId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus

    // Optimistic UI update
    setModels(prevModels =>
      prevModels.map(m =>
        m.id === modelId ? { ...m, is_public: newStatus } : m
      )
    )

    try {
      const response = await fetch(`/api/v1/gallery/models/${modelId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update visibility')
      }

      toast.success(newStatus ? 'Model is now public' : 'Model is now private', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
          fontWeight: '300',
        },
      })
    } catch (error) {
      // Revert optimistic update on error
      setModels(prevModels =>
        prevModels.map(m =>
          m.id === modelId ? { ...m, is_public: currentStatus } : m
        )
      )

      toast.error('Failed to update visibility', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
          fontWeight: '300',
        },
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Box className="w-12 h-12 mx-auto mb-4 animate-spin text-white" strokeWidth={1} />
          <p className="text-sm font-light text-gray-400">Loading your garage...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="bottom-right" />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Model"
        message={`Are you sure you want to delete "${modelToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Ship Design Modal */}
      {modelToShip && (
        <ShipDesignModal
          isOpen={showShipModal}
          onClose={() => {
            setShowShipModal(false)
            setModelToShip(null)
          }}
          model={modelToShip}
          userEmail={user?.email}
        />
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && imageToPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => {
              setShowImagePreview(false)
              setImageToPreview(null)
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowImagePreview(false)
                setImageToPreview(null)
              }}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageToPreview.url || imageToPreview.thumbnail}
                alt={imageToPreview.name}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Image info bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-lg font-light text-white mb-1">{imageToPreview.name}</h3>
                <p className="text-xs text-gray-400">
                  Created {new Date(imageToPreview.created_at).toLocaleDateString()}
                </p>

                {/* Quick actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleDownload(imageToPreview)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-sm font-light text-white transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Model Preview Modal */}
      <AnimatePresence>
        {show3DPreview && model3DToPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => {
              setShow3DPreview(false)
              setModel3DToPreview(null)
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShow3DPreview(false)
                setModel3DToPreview(null)
              }}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* 3D viewer container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl max-h-[85vh] mx-4 bg-gradient-to-b from-slate-900 to-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full aspect-video bg-black">
                <ModelViewer3D modelUrl={model3DToPreview.url} className="w-full h-full" />
              </div>

              {/* Info bar */}
              <div className="p-4 sm:p-6 border-t border-white/10 bg-black/60 backdrop-blur">
                <h3 className="text-base sm:text-lg font-light text-white mb-1 truncate">
                  {model3DToPreview.name || '3D model'}
                </h3>
                <p className="text-xs text-gray-400">
                  Created {new Date(model3DToPreview.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Tour */}
      <OnboardingTour page="garage" />

      {/* Sidebar */}
      <CollapsibleSidebar
        currentPage="garage"
        fullName={profile?.full_name || user?.email?.split('@')[0] || 'User'}
        creditsRemaining={profile?.credits_remaining ?? 0}
        onCollapseChange={setIsCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-56'}`}>
        <div className="p-4 sm:p-6 lg:p-12">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-thin tracking-tight mb-2">
                My Garage
              </h1>
              <p className="text-xs font-light text-gray-500">
                {models.length} {models.length === 1 ? 'model' : 'models'} • {profile?.credits_remaining || 0} credits remaining
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid'
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list'
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Empty State */}
          {models.length === 0 && (
            <div className="text-center py-20">
              <Box className="w-20 h-20 mx-auto mb-6 text-white/20" strokeWidth={1} />
              <h2 className="text-2xl font-thin tracking-tight mb-3">Your garage is empty</h2>
              <p className="text-sm font-light text-gray-500 mb-6">
                Start creating 3D models from your car images
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-red-500/70 via-red-600/60 to-red-500/70 border border-red-500/40 rounded text-sm font-light text-white hover:from-red-500/90 hover:via-red-600/80 hover:to-red-500/90 transition-all"
              >
                <Box className="w-4 h-4" />
                Create 3D Model
              </Link>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && models.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {models.map((model, index) => (
                <div
                  key={model.id}
                  data-tour={index === 0 ? "model-card" : undefined}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded overflow-hidden hover:border-white/20 transition-all"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-video bg-black overflow-hidden rounded-t cursor-pointer"
                    onClick={() =>
                      model.type === 'model3d'
                        ? handle3DPreview(model)
                        : (setImageToPreview(model), setShowImagePreview(true))
                    }
                  >
                    <img
                      src={model.thumbnail}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {model.type === 'model3d' && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-[10px] font-light text-white tracking-wide">
                        3D MODEL
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>

                  {/* Details */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-light text-white truncate flex-1">{model.name}</h3>
                      {/* Publish Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePublic(model.id, model.is_public)
                        }}
                        data-tour={index === 0 ? "public-toggle" : undefined}
                        className={`ml-2 px-2 py-1 rounded text-[10px] font-light transition-all flex items-center gap-1 flex-shrink-0 ${model.is_public
                          ? 'bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        title={model.is_public ? 'Public' : 'Private'}
                      >
                        {model.is_public ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span className="hidden sm:inline">Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span className="hidden sm:inline">Private</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] text-gray-500 mb-4">
                      <span>{model.format}</span>
                      <span>•</span>
                      <span>{model.file_size}</span>
                      <span>•</span>
                      <span>{model.polygons} polys</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(model)}
                        className="flex-1 px-2 sm:px-3 py-2 bg-white/5 border border-white/10 text-[10px] font-light hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      {model.type === 'model3d' && (
                        <button
                          onClick={() => handleShipClick(model)}
                          data-tour={index === 0 ? "ship-button" : undefined}
                          className="flex-1 px-2 sm:px-3 py-2 bg-gradient-to-br from-green-500/70 via-green-600/60 to-green-500/70 border border-green-500/40 text-[10px] font-light text-white hover:from-green-500/90 hover:via-green-600/80 hover:to-green-500/90 transition-all flex items-center justify-center gap-1"
                          title="Ship Design to 3D Printing"
                        >
                          <Truck className="w-3 h-3" />
                          <span className="hidden sm:inline">Ship</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(model)}
                        data-tour={index === 0 ? "download-button" : undefined}
                        className="flex-1 px-2 sm:px-3 py-2 bg-gradient-to-br from-red-500/70 via-red-600/60 to-red-500/70 border border-red-500/40 text-[10px] font-light text-white hover:from-red-500/90 hover:via-red-600/80 hover:to-red-500/90 transition-all flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(model)}
                        className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 text-[10px] font-light hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && models.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded p-4 hover:border-white/20 transition-all flex items-center gap-4"
                >
                  {/* Thumbnail */}
                  <div
                    className="w-24 h-16 bg-black rounded overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      model.type === 'model3d'
                        ? handle3DPreview(model)
                        : (setImageToPreview(model), setShowImagePreview(true))
                    }
                  >
                    <img
                      src={model.thumbnail}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-sm font-light text-white mb-1">{model.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span>{model.format}</span>
                      <span>•</span>
                      <span>{model.file_size}</span>
                      <span>•</span>
                      <span>{model.polygons} polys</span>
                      <span>•</span>
                      <span>{new Date(model.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {/* Publish Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePublic(model.id, model.is_public)
                      }}
                      className={`px-3 py-2 rounded text-xs font-light transition-all flex items-center gap-2 ${model.is_public
                        ? 'bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      title={model.is_public ? 'Public' : 'Private'}
                    >
                      {model.is_public ? (
                        <>
                          <Globe className="w-3 h-3" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Private
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleView(model)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    {model.type === 'model3d' && (
                      <button
                        onClick={() => handleShipClick(model)}
                        className="px-4 py-2 bg-gradient-to-br from-green-500/70 via-green-600/60 to-green-500/70 border border-green-500/40 rounded text-xs font-light text-white hover:from-green-500/90 hover:via-green-600/80 hover:to-green-500/90 transition-all flex items-center gap-2"
                        title="Ship Design to 3D Printing"
                      >
                        <Truck className="w-3 h-3" />
                        Ship
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(model)}
                      className="px-4 py-2 bg-gradient-to-br from-red-500/70 via-red-600/60 to-red-500/70 border border-red-500/40 rounded text-xs font-light text-white hover:from-red-500/90 hover:via-red-600/80 hover:to-red-500/90 transition-all flex items-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteClick(model)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
