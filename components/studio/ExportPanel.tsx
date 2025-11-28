'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Package, Layers, Loader2 } from 'lucide-react'
import * as THREE from 'three'

interface ExportPanelProps {
  modelUrl?: string | null
  geometry?: THREE.BufferGeometry | null
}

export default function ExportPanel({ modelUrl, geometry }: ExportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null)

  const exportFormats = [
    { 
      format: 'STL', 
      desc: '3D Printing Ready', 
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/30'
    },
    { 
      format: 'OBJ', 
      desc: 'Universal Format', 
      icon: Layers,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/10',
      borderColor: 'border-green-500/30'
    }
  ]

  const handleExportSTL = async () => {
    if (!geometry) {
      alert('No model loaded. Please load a model first.')
      return
    }

    setExporting('STL')

    try {
      // Import STL exporter dynamically
      const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter.js')
      const exporter = new STLExporter()

      // Create a mesh from geometry
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: 0x808080 })
      )

      // Export as binary STL
      const stlData = exporter.parse(mesh, { binary: true })
      
      // Create blob and download
      const blob = new Blob([stlData], { type: 'application/sla' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `model-${Date.now()}.stl`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      alert('Failed to export STL. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  const handleExportOBJ = async () => {
    if (!geometry) {
      alert('No model loaded. Please load a model first.')
      return
    }

    setExporting('OBJ')

    try {
      // Import OBJ exporter dynamically
      const { OBJExporter } = await import('three/examples/jsm/exporters/OBJExporter.js')
      const exporter = new OBJExporter()

      // Create a mesh from geometry
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: 0x808080 })
      )

      // Export as OBJ string
      const objData = exporter.parse(mesh)
      
      // Create blob and download
      const blob = new Blob([objData], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `model-${Date.now()}.obj`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      alert('Failed to export OBJ. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  const handleExport = (format: string) => {
    if (format === 'STL') {
      handleExportSTL()
    } else if (format === 'OBJ') {
      handleExportOBJ()
    }
  }

  const hasModel = !!geometry

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Status */}
      {!hasModel && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
          Load a model to enable export
        </div>
      )}

      {/* Export Formats */}
      <div>
        <h3 className="text-xs font-light text-gray-400 mb-3">Download Format</h3>
        <div className="space-y-3">
          {exportFormats.map((item) => (
            <button
              key={item.format}
              onClick={() => handleExport(item.format)}
              disabled={!hasModel || exporting !== null}
              className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${item.bgColor} border ${item.borderColor} rounded-lg hover:brightness-110 transition-all group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-black/30 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{item.format}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {exporting === item.format ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Download className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 border-t border-white/10">
        <div className="text-[10px] text-gray-500 space-y-1">
          <p><span className="text-blue-400">STL</span> - Best for 3D printing. Single color, no textures.</p>
          <p><span className="text-green-400">OBJ</span> - Universal format. Works with most 3D software.</p>
        </div>
      </div>
    </motion.div>
  )
}
