'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2, Download, Eye, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Model {
  id: string
  url: string
  filename: string
  format: string
  category: string
  size: number
  uploadedAt: string
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/models')
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('model', file)
      formData.append('category', 'free')

      const response = await fetch('/api/upload-model', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchModels()
        alert('Model uploaded successfully!')
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (url: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return

    try {
      const response = await fetch(`/api/models?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchModels()
        alert('Model deleted successfully!')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-thin tracking-wider mb-2">MODEL LIBRARY</h1>
            <p className="text-sm text-gray-400">Manage your 3D model collection</p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 border border-white/20 rounded hover:bg-white/5 text-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* Upload Section */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <label className="block">
            <input
              type="file"
              accept=".glb,.gltf,.stl,.obj,.fbx,.usdz"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-300 mb-1">
                {uploading ? 'Uploading...' : 'Click to upload 3D model'}
              </p>
              <p className="text-xs text-gray-500">
                Supported: GLB, STL, OBJ, FBX, USDZ (max 50MB)
              </p>
            </div>
          </label>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Models</p>
            <p className="text-2xl font-light">{models.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Size</p>
            <p className="text-2xl font-light">
              {formatBytes(models.reduce((acc, m) => acc + m.size, 0))}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Formats</p>
            <p className="text-2xl font-light">
              {new Set(models.map(m => m.format)).size}
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchModels}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-white/5 border border-white/10 rounded text-sm hover:bg-white/10 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Models Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading models...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No models uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-light truncate mb-1">{model.filename}</h3>
                    <p className="text-xs text-gray-500">
                      {model.format?.toUpperCase()} • {formatBytes(model.size)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded ml-2">
                    {model.category}
                  </span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={model.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-xs hover:bg-white/10 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </a>
                  <a
                    href={model.url}
                    download
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-xs hover:bg-white/10 flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(model.url)}
                    className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-xs hover:bg-red-500/20 flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  {new Date(model.uploadedAt).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
