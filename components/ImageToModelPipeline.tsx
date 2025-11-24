'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Sparkles, Download, Loader2, MousePointer2, X, Check, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface SegmentPoint {
  x: number
  y: number
  label: 1 | 0 // 1 = include, 0 = exclude
}

interface Segment {
  id: string
  mask: string // base64 encoded mask
  bbox: { x: number, y: number, width: number, height: number }
  confidence: number
}

export default function ImageToModelPipeline() {
  const [image, setImage] = useState<string | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [segmentPoints, setSegmentPoints] = useState<SegmentPoint[]>([])
  const [isSegmenting, setIsSegmenting] = useState(false)
  const [isGenerating3D, setIsGenerating3D] = useState(false)
  const [generated3DUrl, setGenerated3DUrl] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'segment' | 'generate' | 'complete'>('upload')
  
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setStep('segment')
        setSegmentPoints([])
        setSegments([])
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image click for SAM segmentation
  const handleImageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || step !== 'segment') return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * imageRef.current.naturalWidth
    const y = ((e.clientY - rect.top) / rect.height) * imageRef.current.naturalHeight
    
    const newPoint: SegmentPoint = {
      x,
      y,
      label: e.shiftKey ? 0 : 1 // Shift+click for exclusion
    }
    
    const updatedPoints = [...segmentPoints, newPoint]
    setSegmentPoints(updatedPoints)
    
    // Run segmentation
    await runSegmentation(updatedPoints)
  }

  // Run SAM segmentation
  const runSegmentation = async (points: SegmentPoint[]) => {
    if (!image) return
    
    setIsSegmenting(true)
    
    try {
      const response = await fetch('/api/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: image.split(',')[1], // Remove data:image/png;base64,
          points,
          model: 'sam_vit_h'
        })
      })
      
      const result = await response.json()
      setSegments(result.masks || [])
      
      // Auto-select first segment
      if (result.masks?.length > 0) {
        setSelectedSegment(result.masks[0])
      }
    } catch (error) {
      // Use mock segmentation for demo
      const mockSegment: Segment = {
        id: 'mock_1',
        mask: '', // Would be actual mask data
        bbox: { 
          x: Math.min(...points.map(p => p.x)) - 50,
          y: Math.min(...points.map(p => p.y)) - 50,
          width: Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)) + 100,
          height: Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)) + 100
        },
        confidence: 0.95
      }
      setSegments([mockSegment])
      setSelectedSegment(mockSegment)
    } finally {
      setIsSegmenting(false)
    }
  }

  // Generate 3D model from segment
  const generate3DModel = async () => {
    if (!selectedSegment || !image) return
    
    setIsGenerating3D(true)
    setStep('generate')
    
    try {
      // Extract segmented region
      const segmentedImage = await extractSegmentedImage(image, selectedSegment)
      
      // Call 3D generation API (Meshy.ai or similar)
      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: segmentedImage,
          provider: 'meshy', // or 'tripo', 'stable-zero123'
          quality: 'high'
        })
      })
      
      const result = await response.json()
      setGenerated3DUrl(result.modelUrl)
      setStep('complete')
    } catch (error) {
      // Mock 3D generation for demo
      setTimeout(() => {
        setGenerated3DUrl('/models/generated-part.glb')
        setStep('complete')
      }, 3000)
    } finally {
      setIsGenerating3D(false)
    }
  }

  // Extract segmented region from image
  const extractSegmentedImage = async (imageUrl: string, segment: Segment): Promise<string> => {
    // This would use the mask to extract only the segmented part
    // For now, return the crop based on bounding box
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = document.createElement('img')
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = segment.bbox.width
        canvas.height = segment.bbox.height
        ctx.drawImage(
          img,
          segment.bbox.x, segment.bbox.y,
          segment.bbox.width, segment.bbox.height,
          0, 0,
          segment.bbox.width, segment.bbox.height
        )
        resolve(canvas.toDataURL())
      }
      img.src = imageUrl
    })
  }

  // Clear all selections
  const clearSelection = () => {
    setSegmentPoints([])
    setSegments([])
    setSelectedSegment(null)
  }

  // Reset to start
  const reset = () => {
    setImage(null)
    setSegments([])
    setSelectedSegment(null)
    setSegmentPoints([])
    setIsSegmenting(false)
    setIsGenerating3D(false)
    setGenerated3DUrl(null)
    setStep('upload')
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-thin tracking-wider text-white mb-2">
          IMAGE TO 3D MODEL
        </h1>
        <p className="text-gray-400 text-sm">
          Upload an image, select the part you want, and generate a 3D model
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Upload', 'Segment', 'Generate', 'Complete'].map((label, index) => {
          const steps = ['upload', 'segment', 'generate', 'complete']
          const isActive = steps.indexOf(step) >= index
          const isComplete = steps.indexOf(step) > index
          
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isComplete ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-700'}
                  transition-all duration-300
                `}>
                  {isComplete ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white text-sm">{index + 1}</span>
                  )}
                </div>
                <span className={`ml-3 text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
              {index < 3 && (
                <ArrowRight className={`mx-4 w-4 h-4 ${isActive ? 'text-gray-400' : 'text-gray-700'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-black/50 border border-white/10 rounded-lg p-6 min-h-[500px]">
        {/* Upload Step */}
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center p-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-4" />
                <span className="text-white text-lg mb-2">Upload an Image</span>
                <span className="text-gray-400 text-sm">Click to browse or drag and drop</span>
                <span className="text-gray-500 text-xs mt-2">Supports: JPG, PNG, WebP</span>
              </div>
            </label>
          </div>
        )}

        {/* Segment Step */}
        {step === 'segment' && image && (
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Original Image with Click Points */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white text-sm font-medium">Click to Select</h3>
                <div className="flex gap-2">
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600"
                  >
                    Clear Points
                  </button>
                  <button
                    onClick={() => generate3DModel()}
                    disabled={!selectedSegment}
                    className={`px-4 py-1 text-xs rounded flex items-center gap-2 ${
                      selectedSegment
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate 3D
                  </button>
                </div>
              </div>
              
              <div 
                className="relative cursor-crosshair"
                onClick={handleImageClick}
              >
                <img
                  ref={imageRef}
                  src={image}
                  alt="Upload"
                  className="w-full rounded-lg"
                />
                
                {/* Segmentation Points */}
                {segmentPoints.map((point, index) => {
                  const imageEl = imageRef.current
                  if (!imageEl) return null
                  
                  const scaleX = imageEl.width / imageEl.naturalWidth
                  const scaleY = imageEl.height / imageEl.naturalHeight
                  
                  return (
                    <div
                      key={index}
                      className={`absolute w-3 h-3 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 ${
                        point.label === 1
                          ? 'bg-green-400 border-green-600'
                          : 'bg-red-400 border-red-600'
                      }`}
                      style={{
                        left: point.x * scaleX,
                        top: point.y * scaleY,
                      }}
                    />
                  )
                })}
                
                {/* Loading Overlay */}
                {isSegmenting && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-xs text-gray-400">
                <div>• Click to add selection points (green)</div>
                <div>• Shift+Click to exclude areas (red)</div>
              </div>
            </div>

            {/* Right: Segmented Preview */}
            <div>
              <h3 className="text-white text-sm font-medium mb-3">Segmented Preview</h3>
              <div className="bg-gray-900 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                {selectedSegment ? (
                  <div className="w-full">
                    {/* Show bounding box visualization */}
                    <div className="relative">
                      <img src={image} alt="Preview" className="w-full rounded opacity-30" />
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500/20"
                        style={{
                          left: `${(selectedSegment.bbox.x / imageRef.current?.naturalWidth!) * 100}%`,
                          top: `${(selectedSegment.bbox.y / imageRef.current?.naturalHeight!) * 100}%`,
                          width: `${(selectedSegment.bbox.width / imageRef.current?.naturalWidth!) * 100}%`,
                          height: `${(selectedSegment.bbox.height / imageRef.current?.naturalHeight!) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="text-gray-400 text-xs">
                        Confidence: {(selectedSegment.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm text-center">
                    Click on the image to select an object
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generate Step */}
        {step === 'generate' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <Sparkles className="w-16 h-16 text-blue-500 mb-6 animate-pulse" />
            <h2 className="text-white text-xl mb-2">Generating 3D Model</h2>
            <p className="text-gray-400 text-sm mb-6">This may take 30-60 seconds...</p>
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            
            <div className="mt-8 text-center">
              <div className="text-xs text-gray-500">Powered by AI</div>
              <div className="text-xs text-gray-600 mt-2">
                Using advanced photogrammetry and neural reconstruction
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && generated3DUrl && (
          <div className="text-center">
            <div className="bg-gray-900 rounded-lg p-8 mb-6">
              {/* 3D Preview would go here */}
              <div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center mb-4">
                <span className="text-gray-400">3D Model Preview</span>
              </div>
              
              <div className="flex justify-center gap-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download GLB
                </button>
                <button className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
                  Save to Library
                </button>
                <button className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
                  Open in Studio
                </button>
              </div>
            </div>
            
            <button
              onClick={reset}
              className="text-gray-400 hover:text-white text-sm"
            >
              Generate Another Model
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
