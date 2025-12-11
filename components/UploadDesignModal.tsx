'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileUp, Loader2, DollarSign, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadDesignModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (asset: any) => void
}

const CATEGORIES = [
    { value: 'automotive', label: 'Automotive' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'home', label: 'Home & Decor' },
    { value: 'gadgets', label: 'Gadgets & Tech' },
    { value: 'art', label: 'Art & Sculptures' },
    { value: 'other', label: 'Other' },
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export default function UploadDesignModal({ isOpen, onClose, onSuccess }: UploadDesignModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('other')
    const [creatorPrice, setCreatorPrice] = useState('')
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const resetForm = () => {
        setFile(null)
        setName('')
        setDescription('')
        setCategory('other')
        setCreatorPrice('')
        setUploading(false)
        setDragOver(false)
    }

    const handleClose = () => {
        if (!uploading) {
            resetForm()
            onClose()
        }
    }

    const validateFile = (file: File): string | null => {
        if (!file.name.toLowerCase().endsWith('.stl')) {
            return 'Only STL files are supported'
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be under 50MB'
        }
        return null
    }

    const handleFileSelect = useCallback((selectedFile: File) => {
        const error = validateFile(selectedFile)
        if (error) {
            toast.error(error, {
                style: {
                    background: '#0a0a0a',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            })
            return
        }

        setFile(selectedFile)
        // Auto-fill name from filename if empty
        if (!name) {
            const baseName = selectedFile.name.replace(/\.stl$/i, '').replace(/[-_]/g, ' ')
            setName(baseName)
        }
    }, [name])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            handleFileSelect(droppedFile)
        }
    }, [handleFileSelect])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
    }

    const handleUpload = async () => {
        if (!file || !name.trim()) {
            toast.error('Please provide a file and name')
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('name', name.trim())
            formData.append('description', description.trim())
            formData.append('category', category)
            if (creatorPrice) {
                formData.append('creator_price', creatorPrice)
            }

            const response = await fetch('/api/v1/upload-design', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            toast.success('Design uploaded successfully!', {
                style: {
                    background: '#0a0a0a',
                    color: '#fff',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                },
                icon: '🎉',
            })

            onSuccess?.(data.asset)
            handleClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload design', {
                style: {
                    background: '#0a0a0a',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                },
            })
        } finally {
            setUploading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-light text-white">Upload Design</h2>
                                <p className="text-xs text-gray-500">Share your STL file on the marketplace</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={uploading}
                            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {/* File Upload Zone */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                                STL File *
                            </label>
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                  border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                  ${dragOver
                                        ? 'border-red-500 bg-red-500/10'
                                        : file
                                            ? 'border-green-500/50 bg-green-500/5'
                                            : 'border-white/20 hover:border-white/40 bg-white/[0.02]'
                                    }
                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".stl"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                />

                                {file ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <Check className="w-6 h-6 text-green-500" />
                                        <div className="text-left">
                                            <p className="text-sm text-white font-light">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <FileUp className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                                        <p className="text-sm text-gray-400 font-light mb-1">
                                            Drag and drop your STL file here
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            or click to browse • Max 50MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Name & Description Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Design Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Geometric Phone Stand"
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description..."
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Category & Price Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value} className="bg-black">
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Your Earnings After Fulfillment
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={creatorPrice}
                                        onChange={(e) => setCreatorPrice(e.target.value)}
                                        placeholder="5.00"
                                        className="w-full bg-white/5 border border-white/10 rounded pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 flex gap-3">
                        <button
                            onClick={handleClose}
                            disabled={uploading}
                            className="flex-1 py-3 border border-white/10 text-sm font-light text-gray-400 hover:text-white hover:border-white/30 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !file || !name.trim()}
                            className="flex-1 py-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-sm font-light text-white hover:bg-red-500/30 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload Design
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
