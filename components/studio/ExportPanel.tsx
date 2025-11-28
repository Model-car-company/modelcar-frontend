'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Box, Layers, Loader2, ArrowDownToLine } from 'lucide-react'
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
      icon: Box,
    },
    { 
      format: 'OBJ', 
      desc: 'Universal Format', 
      icon: Layers,
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
      
      // Create blob and download - handle both DataView and string outputs
      const blobPart = stlData instanceof DataView ? new Uint8Array(stlData.buffer) : stlData
      const blob = new Blob([blobPart], { type: 'application/sla' })
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
      className="space-y-5"
    >
      {/* Status */}
      {!hasModel && (
        <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-gray-400 font-light tracking-wide">
          Load a model to enable export
        </div>
      )}

      {/* Export Formats */}
      <div>
        <h3 className="text-[10px] font-extralight tracking-[0.2em] text-gray-500 uppercase mb-4">Download Format</h3>
        <div className="space-y-3">
          {exportFormats.map((item, index) => (
            <motion.button
              key={item.format}
              onClick={() => handleExport(item.format)}
              disabled={!hasModel || exporting !== null}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full group relative overflow-hidden"
            >
              <div className={`
                flex items-center justify-between p-4
                bg-white/[0.02] hover:bg-white/[0.06]
                border border-white/10 hover:border-white/20
                rounded-lg transition-all duration-300
                disabled:opacity-40 disabled:cursor-not-allowed
              `}>
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                    <item.icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-light tracking-wide text-white group-hover:text-white transition-colors">{item.format}</div>
                    <div className="text-[10px] font-extralight text-gray-500 tracking-wide">{item.desc}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  {exporting === item.format ? (
                    <div className="p-2">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-white/0 group-hover:bg-white/10 transition-all">
                      <ArrowDownToLine className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>
              {/* Subtle hover glow */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/[0.02] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 border-t border-white/5">
        <div className="text-[10px] text-gray-600 space-y-1.5 font-extralight tracking-wide">
          <p><span className="text-gray-400">STL</span> — Best for 3D printing</p>
          <p><span className="text-gray-400">OBJ</span> — Universal format</p>
        </div>
      </div>
    </motion.div>
  )
}
