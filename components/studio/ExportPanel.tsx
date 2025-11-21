'use client'

import { motion } from 'framer-motion'
import { Download, Package, Layers, Cpu, Triangle, Square, FileText, Share2 } from 'lucide-react'

interface ExportPanelProps {
  modelUrl?: string | null;
}

export default function ExportPanel({ modelUrl }: ExportPanelProps) {
  const exportFormats = [
    { 
      format: 'STL', 
      desc: '3D Printing', 
      icon: Package,
      size: '12.4 MB',
      color: 'text-blue-400'
    },
    { 
      format: 'OBJ', 
      desc: 'With Textures', 
      icon: Layers,
      size: '18.2 MB',
      color: 'text-green-400'
    },
    { 
      format: 'GLB', 
      desc: 'Web & AR', 
      icon: Cpu,
      size: '8.7 MB',
      color: 'text-purple-400'
    },
    { 
      format: 'FBX', 
      desc: 'Animation', 
      icon: Triangle,
      size: '15.3 MB',
      color: 'text-orange-400'
    },
    { 
      format: 'USDZ', 
      desc: 'Apple AR', 
      icon: Square,
      size: '9.1 MB',
      color: 'text-pink-400'
    }
  ]

  const handleExport = async (format: string) => {
    if (!modelUrl) {
      alert('No model loaded. Please generate or upload a model first.')
      return
    }

    try {
      // For now, download directly if format matches
      // In production, convert through API if needed
      const link = document.createElement('a')
      link.href = modelUrl
      link.download = `model-${Date.now()}.${format.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // TODO: If format conversion needed, call API
      // const response = await fetch('/api/convert-model', {
      //   method: 'POST',
      //   body: JSON.stringify({ modelUrl, targetFormat: format }),
      // })
      
      console.log(`Exported as ${format}`)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export model. Please try again.')
    }
  }

  const handleShare = () => {
    console.log('Sharing model...')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Export Formats */}
      <div>
        <h3 className="text-xs font-light text-gray-400 mb-3">Export Format</h3>
        <div className="space-y-2">
          {exportFormats.map((item) => (
            <button
              key={item.format}
              onClick={() => handleExport(item.format)}
              className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <div className="text-left">
                  <div className="text-sm font-light">{item.format}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{item.size}</span>
                <Download className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Settings */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-light text-gray-400 mb-3">Export Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-gray-400">Include Textures</span>
            <input type="checkbox" defaultChecked className="rounded border-gray-600 text-purple-500 focus:ring-purple-500" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-gray-400">Compress File</span>
            <input type="checkbox" defaultChecked className="rounded border-gray-600 text-purple-500 focus:ring-purple-500" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-gray-400">Embed Materials</span>
            <input type="checkbox" defaultChecked className="rounded border-gray-600 text-purple-500 focus:ring-purple-500" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-gray-400">Apply Transforms</span>
            <input type="checkbox" className="rounded border-gray-600 text-purple-500 focus:ring-purple-500" />
          </label>
        </div>
      </div>

      {/* Resolution Options */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-light text-gray-400 mb-3">Mesh Density</h3>
        <div className="space-y-2">
          {[
            { level: 'Original', polys: '1,000,746', selected: true },
            { level: 'High', polys: '500,000', selected: false },
            { level: 'Medium', polys: '100,000', selected: false },
            { level: 'Low', polys: '25,000', selected: false },
          ].map((option) => (
            <label key={option.level} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="resolution" 
                  defaultChecked={option.selected}
                  className="text-purple-500 focus:ring-purple-500" 
                />
                <span className="text-xs text-gray-300">{option.level}</span>
              </div>
              <span className="text-xs text-gray-500">{option.polys} polys</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <FileText className="w-3 h-3" />
            Export All
          </button>
          <button 
            onClick={handleShare}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded text-xs font-light hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-3 h-3" />
            Share Link
          </button>
        </div>
      </div>

      {/* Export History */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-xs font-light text-gray-400 mb-3">Recent Exports</h3>
        <div className="space-y-2">
          {[
            { name: 'model_v3.stl', time: '10m ago', size: '8.2 MB' },
            { name: 'car_final.glb', time: '1h ago', size: '12.1 MB' },
            { name: 'prototype.obj', time: '3h ago', size: '15.7 MB' },
          ].map((file, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
              <div className="flex items-center gap-2">
                <Download className="w-3 h-3 text-gray-500" />
                <span className="text-gray-300">{file.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span>{file.size}</span>
                <span>•</span>
                <span>{file.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
