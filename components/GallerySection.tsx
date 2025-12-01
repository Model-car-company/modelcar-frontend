'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, X } from 'lucide-react'
import ModelViewer3D from './ModelViewer3D'
import { AnimatePresence, motion } from 'framer-motion'

interface GalleryModel {
    id: string
    name: string
    thumbnail: string
    url: string
    creator: string
    created_at: string
    type: 'image' | 'model3d'
    format: string
}

export default function GallerySection() {
    const router = useRouter()
    const [models, setModels] = useState<GalleryModel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showImagePreview, setShowImagePreview] = useState(false)
    const [imageToPreview, setImageToPreview] = useState<GalleryModel | null>(null)
    const [show3DPreview, setShow3DPreview] = useState(false)
    const [modelToPreview, setModelToPreview] = useState<GalleryModel | null>(null)

    useEffect(() => {
        loadGalleryModels()
    }, [])

    const loadGalleryModels = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/v1/gallery?limit=50')

            if (!response.ok) {
                throw new Error('Failed to fetch gallery')
            }

            const data = await response.json()
            setModels(data.models || [])
            setError(null)
        } catch (err) {
            console.error('Error loading gallery:', err)
            setError('Failed to load community gallery')
        } finally {
            setLoading(false)
        }
    }

    const handleModelClick = (model: GalleryModel) => {
        if (model.type === 'image') {
            setImageToPreview(model)
            setShowImagePreview(true)
        } else {
            setModelToPreview(model)
            setShow3DPreview(true)
        }
    }

    if (error) {
        return null // Silently fail if gallery can't load
    }

    if (!loading && models.length === 0) {
        return null // Don't show section if no public models
    }

    return (
        <>
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
                            <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-2xl overflow-hidden">
                                <ModelViewer3D modelUrl={modelToPreview.url} className="w-full h-full" />
                            </div>

                            {/* Model info bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                                <h3 className="text-lg font-light text-white mb-1">{modelToPreview.name}</h3>
                                <p className="text-xs text-gray-400">
                                    by {modelToPreview.creator} • {new Date(modelToPreview.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-8 sm:mb-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                    <h2 className="text-base sm:text-lg font-thin tracking-tight text-gray-400">
                        Community Gallery
                    </h2>
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
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {models.map((model) => (
                            <div
                                key={model.id}
                                className="cursor-pointer group relative"
                                onClick={() => handleModelClick(model)}
                            >
                                <div className="glass border border-white/10 rounded overflow-hidden hover:border-white/20 transition-all hover:scale-[1.02] duration-300 aspect-video relative">
                                    {/* Full Image/Model */}
                                    <div className="absolute inset-0">
                                        {model.type === 'model3d' ? (
                                            <ModelViewer3D modelUrl={model.url} className="w-full h-full" />
                                        ) : (
                                            <img
                                                src={model.thumbnail}
                                                alt={model.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        )}
                                    </div>

                                    {/* Format badge - sleeker and smaller */}
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[9px] font-light text-white/70 border border-white/10">
                                        {model.format}
                                    </div>

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
