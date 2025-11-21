'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Download, AlertCircle } from 'lucide-react'
import { useStudioStore } from '@/lib/store/studio-store'
import { ExportOptions } from '@/lib/types/car-parts'

interface ExportDialogProps {
  onClose: () => void
}

export default function ExportDialog({ onClose }: ExportDialogProps) {
  const { exportAssembly } = useStudioStore()
  const [exporting, setExporting] = useState(false)
  
  const [options, setOptions] = useState<ExportOptions>({
    format: 'stl',
    separateParts: true,
    includeSupports: false,
    scale: 1.0,
    units: 'mm',
    quality: 'high',
  })

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportAssembly(options)
      onClose()
    } catch (error) {
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-black border border-white/10 rounded-lg max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-thin tracking-wider">EXPORT MODEL</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-light text-gray-400 mb-3 block">
              File Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['stl', 'obj', 'glb'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setOptions({ ...options, format })}
                  className={`px-4 py-3 rounded text-sm uppercase transition-colors ${
                    options.format === format
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="text-sm font-light text-gray-400 mb-3 block">
              Mesh Quality
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['draft', 'standard', 'high', 'ultra'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => setOptions({ ...options, quality })}
                  className={`px-3 py-2 rounded text-xs capitalize transition-colors ${
                    options.quality === quality
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          {/* Scale & Units */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-light text-gray-400 mb-2 block">
                Scale
              </label>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={options.scale}
                onChange={(e) => setOptions({ ...options, scale: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm focus:outline-none focus:border-red-500/50"
              />
            </div>
            
            <div>
              <label className="text-sm font-light text-gray-400 mb-2 block">
                Units
              </label>
              <select
                value={options.units}
                onChange={(e) => setOptions({ ...options, units: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm focus:outline-none focus:border-red-500/50"
              >
                <option value="mm">Millimeters</option>
                <option value="cm">Centimeters</option>
                <option value="inches">Inches</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.separateParts}
                onChange={(e) => setOptions({ ...options, separateParts: e.target.checked })}
                className="rounded border-gray-600 text-red-500 focus:ring-red-500"
              />
              <div>
                <div className="text-sm text-gray-300">Separate Parts</div>
                <div className="text-xs text-gray-500">Export each part as individual file</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeSupports}
                onChange={(e) => setOptions({ ...options, includeSupports: e.target.checked })}
                className="rounded border-gray-600 text-red-500 focus:ring-red-500"
              />
              <div>
                <div className="text-sm text-gray-300">Generate Supports</div>
                <div className="text-xs text-gray-500">Auto-generate print supports</div>
              </div>
            </label>
          </div>

          {/* Info */}
          <div className="flex gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-200">
              <p className="font-medium mb-1">Print-Ready Export</p>
              <p className="text-blue-300/80">
                Models will be optimized for 3D printing with proper orientation and scale.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded text-sm hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
