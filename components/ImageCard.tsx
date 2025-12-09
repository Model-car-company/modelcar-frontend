'use client'

import { useState, useRef } from 'react'
import { Download, Plus, Minus, Sparkles, FileText, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface SegmentPoint {
  x: number
  y: number
  label: 1 | 0
}

interface ImageCardProps {
  image: {
    id: string
    url: string
    prompt: string
    timestamp: string
    isGenerating?: boolean
  }
  onGenerate3D?: (imageUrl: string, points: SegmentPoint[]) => void
  onMake3D?: (imageUrl: string, blueprintFile?: File) => void
}

export default function ImageCard({ image, onGenerate3D, onMake3D }: ImageCardProps) {
  const [segmentPoints, setSegmentPoints] = useState<SegmentPoint[]>([])
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null)
  const [blueprintPreview, setBlueprintPreview] = useState<string | null>(null)
  const blueprintInputRef = useRef<HTMLInputElement>(null)
  const [segmentMode, setSegmentMode] = useState<'add' | 'remove' | null>(null)

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!segmentMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const newPoint: SegmentPoint = { x, y, label: segmentMode === 'add' ? 1 : 0 }
    setSegmentPoints(prev => [...prev, newPoint])
  }

  const startAddMode = () => {
    setSegmentMode('add')
    if (segmentPoints.length === 0) toast.success('Click to add segments (areas to include)')
  }

  const startRemoveMode = () => {
    setSegmentMode('remove')
    if (segmentPoints.length === 0) toast.success('Click to exclude segments (areas to remove)')
  }

  const clearSegments = () => {
    setSegmentPoints([])
    setSegmentMode(null)
  }

  const handleGenerate3D = () => {
    if (segmentPoints.length === 0) {
      toast.error('Please add segments first')
      return
    }
    onGenerate3D?.(image.url, segmentPoints)
  }

  const handleBlueprintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBlueprintFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBlueprintPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      toast.success('Blueprint added! Click Make 3D for accurate dimensions.')
    }
  }

  const removeBlueprint = () => {
    setBlueprintFile(null)
    setBlueprintPreview(null)
    if (blueprintInputRef.current) {
      blueprintInputRef.current.value = ''
    }
  }

  const handleMake3DClick = () => {
    onMake3D?.(image.url, blueprintFile || undefined)
  }

  const includeCount = segmentPoints.filter(p => p.label === 1).length
  const excludeCount = segmentPoints.filter(p => p.label === 0).length

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-black/50 group" data-tour="image-card">
      <div className="aspect-video bg-gray-900 relative">
        {image.isGenerating ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-pulse">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-white/30 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-xs font-light text-gray-400 mt-4">Generating image...</p>
            <p className="text-[10px] text-gray-600 mt-1">This may take 5-15 seconds</p>
          </div>
        ) : (
          <img 
            src={image.url}
            alt={image.prompt}
            className={`w-full h-full object-cover ${segmentMode ? 'cursor-crosshair' : ''}`}
            onClick={handleImageClick}
          />
        )}

        {!image.isGenerating && segmentPoints.map((point, idx) => (
          <div
            key={idx}
            className={`absolute w-3 h-3 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 ${
              point.label === 1 ? 'bg-green-400 border-green-600' : 'bg-red-400 border-red-600'
            }`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <div className={`absolute inset-0 rounded-full animate-ping ${point.label === 1 ? 'bg-green-400' : 'bg-red-400'} opacity-25`} />
          </div>
        ))}

        {!image.isGenerating && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                <button onClick={startAddMode} className={`px-2.5 py-1.5 text-[11px] transition-colors flex items-center gap-1.5 ${segmentMode === 'add' ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  <Plus className="w-3 h-3" />
                  Add
                </button>
                <button onClick={startRemoveMode} className={`px-2.5 py-1.5 text-[11px] transition-colors flex items-center gap-1.5 ${segmentMode === 'remove' ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  <Minus className="w-3 h-3" />
                  Remove
                </button>
                {segmentPoints.length > 0 && (
                  <button onClick={clearSegments} className="px-2.5 py-1.5 bg-white/10 text-white text-[11px] hover:bg-white/20 transition-colors">Clear</button>
                )}
                <a href={image.url} download className="px-2.5 py-1.5 bg-white/10 text-white text-[11px] hover:bg-white/20 transition-colors flex items-center">
                  <Download className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2 items-center">
                {/* Hidden file input for blueprint */}
                <input
                  ref={blueprintInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBlueprintChange}
                  className="hidden"
                />
                
                {/* Blueprint indicator or button */}
                {blueprintFile ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600/20 border border-red-500/50 text-red-400 text-[11px]">
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[60px] truncate">{blueprintFile.name}</span>
                    <button onClick={removeBlueprint} className="hover:text-red-300">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative group" data-tour="add-blueprint">
                    <button 
                      onClick={() => blueprintInputRef.current?.click()} 
                      className="px-3 py-1.5 text-[11px] transition-colors flex items-center gap-1.5 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30"
                    >
                      <FileText className="w-3 h-3" />
                      Add Blueprint
                    </button>
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/20 rounded text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Add a blueprint for accurate dimensions
                    </div>
                  </div>
                )}
                
                <button onClick={handleMake3DClick} data-tour="make-3d" className="px-3 py-1.5 text-[11px] transition-colors flex items-center gap-1.5 bg-white text-black hover:bg-gray-200">
                  <Sparkles className="w-3 h-3" />
                  Make 3D
                </button>
              </div>
            </div>
            {segmentPoints.length > 0 && (
              <div className="mt-2 flex gap-3 text-[10px]">
                {includeCount > 0 && <span className="text-green-400">+{includeCount} include</span>}
                {excludeCount > 0 && <span className="text-red-400">-{excludeCount} exclude</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-black/30">
        <p className="text-xs text-gray-400 line-clamp-2">{image.prompt}</p>
      </div>
    </div>
  )
}
