'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eraser, Undo, Redo, Trash2, Paintbrush, Minus, Plus } from 'lucide-react'

interface SketchPadProps {
  onClose: () => void
  onRender: (sketchDataUrl: string) => void
}

export default function SketchPad({ onClose, onRender }: SketchPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(3)
  const [color, setColor] = useState('#000000')
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyStep, setHistoryStep] = useState(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Fill with white background
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Save initial state
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      setHistory([imageData])
      setHistoryStep(0)
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Save to history
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyStep <= 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const newStep = historyStep - 1
    setHistoryStep(newStep)
    ctx.putImageData(history[newStep], 0, 0)
  }

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const newStep = historyStep + 1
    setHistoryStep(newStep)
    ctx.putImageData(history[newStep], 0, 0)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save to history
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const handleRender = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png')
    onRender(dataUrl)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black border border-white/10 rounded-lg overflow-hidden max-w-6xl w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-thin tracking-[0.2em]">SKETCH YOUR CAR</h2>
              <p className="text-xs text-gray-400 mt-1">Draw your design, then click Render</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-white/5">
            {/* Tool Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setTool('pen')}
                className={`p-2 rounded ${
                  tool === 'pen' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                }`}
                title="Pen"
              >
                <Paintbrush className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded ${
                  tool === 'eraser' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Minus className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-2 min-w-[80px]">
                <div
                  className="rounded-full bg-white"
                  style={{
                    width: Math.min(brushSize * 2, 20),
                    height: Math.min(brushSize * 2, 20),
                  }}
                />
                <span className="text-xs text-gray-400">{brushSize}px</span>
              </div>
              <button
                onClick={() => setBrushSize(Math.min(50, brushSize + 1))}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Color:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>

            <div className="flex-1" />

            {/* History Controls */}
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={historyStep <= 0}
                className="p-2 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyStep >= history.length - 1}
                className="p-2 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-2 rounded hover:bg-white/10 text-red-400"
                title="Clear Canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="p-4 bg-gray-900 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border border-white/20 rounded cursor-crosshair bg-white"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-xs text-gray-400">
              💡 Tip: Draw simple outlines. The AI will add details when rendering.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-white/20 rounded hover:bg-white/10 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRender}
                className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 text-sm font-medium flex items-center gap-2"
              >
                <Paintbrush className="w-4 h-4" />
                Render
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
