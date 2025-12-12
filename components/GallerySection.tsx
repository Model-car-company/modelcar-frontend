'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, Truck, Users, Car, Gamepad2, Film, Gem, Palette, Building2, Search, X, Share2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import ModelViewer3D from './ModelViewer3D'
import ShipDesignModal from './ShipDesignModal'
import { AnimatePresence, motion } from 'framer-motion'
import { analytics, AnalyticsEvents } from '../lib/analytics'

interface GalleryModel {
    id: string
    name: string
    thumbnail: string
    url: string
    creator: string
    creator_id: string
    created_at: string
    type: 'image' | 'model3d'
    format: string
    category?: string
    hearts_count?: number
}

const categories = [
    { id: 'all', label: 'All', icon: Package },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'film', label: 'Film', icon: Film },
    { id: 'jewelry', label: 'Jewelry', icon: Gem },
    { id: 'art', label: 'Art', icon: Palette },
    { id: 'architecture', label: 'Architecture', icon: Building2 },
    { id: 'toys', label: 'Toys', icon: Package },
]

export default function GallerySection() {
    const router = useRouter()
    const [models, setModels] = useState<GalleryModel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showImagePreview, setShowImagePreview] = useState(false)
    const [imageToPreview, setImageToPreview] = useState<GalleryModel | null>(null)
    const [show3DPreview, setShow3DPreview] = useState(false)
    const [modelToPreview, setModelToPreview] = useState<GalleryModel | null>(null)
    const [showShipModal, setShowShipModal] = useState(false)
    const [modelToShip, setModelToShip] = useState<GalleryModel | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const searchParams = useSearchParams()

    // Deep Linking: Auto-open purchase modal if params exist
    useEffect(() => {
        const handleDeepLink = async () => {
            const action = searchParams.get('action')
            const assetId = searchParams.get('assetId')

            if (action === 'buy' && assetId) {
                // First check if model is already loaded
                const existingModel = models.find(m => m.id === assetId)

                if (existingModel) {
                    setModelToShip(existingModel)
                    setShowShipModal(true)
                } else {
                    // If not found, fetch it specifically
                    try {
                        const response = await fetch(`/api/v1/gallery/models/${assetId}`)
                        if (response.ok) {
                            const modelData = await response.json()
                            setModelToShip(modelData)
                            setShowShipModal(true)
                        }
                    } catch {
                        // Silent fail - model not found
                    }
                }

                // Clean up URL without reload
                const newUrl = window.location.pathname
                window.history.replaceState({}, '', newUrl)
            }
        }

        handleDeepLink()
    }, [models, searchParams])

    useEffect(() => {
        fetchGallery()
    }, [selectedCategory])

    const fetchGallery = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('/api/v1/gallery')

            if (!response.ok) {
                throw new Error('Failed to fetch gallery')
            }

            const data = await response.json()

            // Filter by category if not 'all'
            let filteredModels = data.models || []
            if (selectedCategory !== 'all') {
                filteredModels = filteredModels.filter((m: GalleryModel) => m.category === selectedCategory)
            }

            setModels(filteredModels)
            setError(null)

            // Track gallery view
            analytics.track(AnalyticsEvents.GALLERY_VIEWED, {
                models_count: filteredModels.length,
                category: selectedCategory
            })
        } catch (err) {
            setError('Failed to load community gallery')
        } finally {
            setLoading(false)
        }
    }

    const handleModelClick = (model: GalleryModel) => {
        // Track click
        analytics.track(AnalyticsEvents.GALLERY_DESIGN_CLICKED, {
            model_id: model.id,
            model_type: model.type,
            creator: model.creator
        })

        if (model.type === 'image') {
            setImageToPreview(model)
            setShowImagePreview(true)
        } else {
            setModelToPreview(model)
            setShow3DPreview(true)

            // Track 3D preview opened
            analytics.track(AnalyticsEvents.GALLERY_3D_PREVIEW_OPENED, {
                model_id: model.id,
                creator: model.creator
            })
        }
    }

    if (error) {
        return null // Silently fail if gallery can't load
    }

    return (
        <>
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                },
            }} />
            {/* Ship Design Modal */}
            {modelToShip && (
                <ShipDesignModal
                    isOpen={showShipModal}
                    onClose={() => {
                        setShowShipModal(false)
                        setModelToShip(null)
                    }}
                    model={{
                        id: modelToShip.id,
                        name: modelToShip.name,
                        thumbnail: modelToShip.thumbnail,
                        url: modelToShip.url,
                        format: modelToShip.format
                    }}
                    assetId={modelToShip.id}
                    creatorId={modelToShip.creator_id}
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
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
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

                            {/* Like button - bottom right */}
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                        const response = await fetch(`/api/v1/gallery/models/${imageToPreview.id}/like`, {
                                            method: 'POST'
                                        })
                                        if (response.ok) {
                                            const data = await response.json()
                                            setModels(prev => prev.map(m =>
                                                m.id === imageToPreview.id ? { ...m, hearts_count: data.hearts_count } : m
                                            ))
                                            setImageToPreview({ ...imageToPreview, hearts_count: data.hearts_count })
                                        }
                                    } catch {
                                        // Silent fail on like error
                                    }
                                }}
                                className="absolute bottom-6 right-6 p-3 bg-black/40 backdrop-blur-md border border-white/20 rounded hover:bg-black/60 transition-all shadow-lg"
                            >
                                <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </button>

                            {/* Image info bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                                <h3 className="text-lg font-light text-white mb-1">{imageToPreview.name}</h3>
                                <p className="text-xs text-gray-400">
                                    by {imageToPreview.creator} • {new Date(imageToPreview.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3D Model Preview Modal */}
            <AnimatePresence>
                {show3DPreview && modelToPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
                        onClick={() => {
                            setShow3DPreview(false)
                            setModelToPreview(null)
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setShow3DPreview(false)
                                setModelToPreview(null)
                            }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* 3D Model container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-5xl h-[85vh] mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black shadow-2xl overflow-hidden">
                                <ModelViewer3D modelUrl={modelToPreview.url} className="w-full h-full" />
                            </div>

                            {/* Share button - bottom right (next to like) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const url = `${window.location.origin}/dashboard?assetId=${modelToPreview.id}&action=buy`
                                    navigator.clipboard.writeText(url)
                                    toast.success('Magic Link copied to clipboard!')
                                }}
                                className="absolute bottom-6 right-20 p-3 bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all shadow-lg z-10"
                                title="Share Design"
                            >
                                <Share2 className="w-5 h-5 text-white" />
                            </button>

                            {/* Like button - bottom right */}
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                        const response = await fetch(`/api/v1/gallery/models/${modelToPreview.id}/like`, {
                                            method: 'POST'
                                        })
                                        if (response.ok) {
                                            const data = await response.json()
                                            setModels(prev => prev.map(m =>
                                                m.id === modelToPreview.id ? { ...m, hearts_count: data.hearts_count } : m
                                            ))
                                            setModelToPreview({ ...modelToPreview, hearts_count: data.hearts_count })
                                        }
                                    } catch {
                                        // Silent fail on like error
                                    }
                                }}
                                className="absolute bottom-6 right-6 p-3 bg-black/40 backdrop-blur-md border border-white/20 rounded hover:bg-black/60 transition-all shadow-lg z-10"
                            >
                                <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </button>

                            {/* Model info bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                                <h3 className="text-lg font-light text-white mb-1">{modelToPreview.name}</h3>
                                <p className="text-xs text-gray-400">
                                    by {modelToPreview.creator} • {new Date(modelToPreview.created_at).toLocaleDateString()}
                                </p>

                                {/* Purchase button */}
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setModelToShip(modelToPreview)
                                            setShow3DPreview(false)
                                            setShowShipModal(true)
                                        }}
                                        className="px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-sm text-sm font-light text-white hover:bg-green-500/30 hover:border-green-500/50 transition-all flex items-center gap-2"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Purchase Design
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-8 sm:mb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                        <h2 className="text-base sm:text-lg font-thin tracking-tight text-gray-400">
                            Community Gallery
                        </h2>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search designs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchGallery()}
                            className="w-full bg-black/20 border border-white/10 rounded px-4 py-2 pl-10 text-sm font-light text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat) => {
                        const Icon = cat.icon
                        const isActive = selectedCategory === cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`
                                    px-4 py-2 flex items-center gap-2 transition-all duration-200
                                    border font-light text-sm
                                    ${isActive
                                        ? 'bg-white text-black border-white'
                                        : 'bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white/80'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" strokeWidth={1.5} />
                                {cat.label}
                            </button>
                        )
                    })}
                </div>


                {/* Gallery Grid */}
                {loading ? (
                    // Loading skeleton
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded overflow-hidden aspect-video" />
                            </div>
                        ))}
                    </div>
                ) : models.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="text-center max-w-md">
                            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" strokeWidth={1} />
                            <h3 className="text-lg font-light text-white/60 mb-2">
                                No designs in this category yet
                            </h3>
                            <p className="text-sm text-white/40 font-light mb-6">
                                Be the first to create and share something amazing in {categories.find(c => c.id === selectedCategory)?.label || 'this category'}!
                            </p>
                            <button
                                onClick={() => router.push('/image')}
                                className="px-6 py-2 bg-white text-black border border-white font-light text-sm hover:bg-white/90 transition-all"
                            >
                                Create Design
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {models.map((model) => (
                            <div
                                key={model.id}
                                className="cursor-pointer group relative"
                                onClick={() => handleModelClick(model)}
                            >
                                <div className="glass border border-white/10 rounded overflow-hidden hover:border-white/20 transition-all hover:scale-[1.02] duration-300 aspect-video relative">
                                    {/* Thumbnail image (3D models open in 3D modal on click) */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={model.thumbnail}
                                            alt={model.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Format badge - sleeker and smaller */}
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[9px] font-light text-white/70 border border-white/10">
                                        {model.format}
                                    </div>

                                    {/* Hearts counter - bottom right, only show if > 0 */}
                                    {model.hearts_count && model.hearts_count > 0 && (
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px] font-light text-white/90 border border-white/10 flex items-center gap-1">
                                            <svg className="w-3 h-3 fill-red-500" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                            <span>{model.hearts_count}</span>
                                        </div>
                                    )}

                                    {/* Sleek text overlay - ONLY ON HOVER */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        {/* Subtle gradient for text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Text content */}
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-sm sm:text-base font-light text-white mb-1 truncate drop-shadow-lg">
                                                {model.name}
                                            </h3>
                                            <p className="text-[10px] sm:text-xs text-gray-200 truncate drop-shadow-lg">
                                                by {model.creator}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
