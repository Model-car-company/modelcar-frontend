'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import CollapsibleSidebar from '../../components/CollapsibleSidebar'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Download, Trash2, Eye, Box, Grid3x3, List } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

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

      if (error) {
        console.error('Failed to load assets:', error)
      }

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
          type: asset.type
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

  const handleDownload = (model: any) => {
    toast.success(`Downloading ${model.name}`, {
      style: {
        background: '#0a0a0a',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '12px',
        fontWeight: '300',
      },
    })
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
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white/10 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
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
              {models.map((model) => (
                <div
                  key={model.id}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded overflow-hidden hover:border-white/20 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black overflow-hidden rounded-t">
                    <img
                      src={model.thumbnail}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Details */}
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm font-light text-white mb-2">{model.name}</h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] text-gray-500 mb-4">
                      <span>{model.format}</span>
                      <span>•</span>
                      <span>{model.file_size}</span>
                      <span>•</span>
                      <span>{model.polygons} polys</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/studio?model=${model.id}`}
                        className="flex-1 px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-light hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
                      </Link>
                      <button
                        onClick={() => handleDownload(model)}
                        className="flex-1 px-2 sm:px-3 py-2 bg-gradient-to-br from-red-500/70 via-red-600/60 to-red-500/70 border border-red-500/40 rounded text-[10px] font-light text-white hover:from-red-500/90 hover:via-red-600/80 hover:to-red-500/90 transition-all flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(model)}
                        className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-light hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center"
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
                  <div className="w-24 h-16 bg-black rounded overflow-hidden flex-shrink-0">
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
                    <Link
                      href={`/studio?model=${model.id}`}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Link>
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
