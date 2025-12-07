'use client'

import { useState, useCallback, useEffect } from 'react'
import Studio3DViewerBabylon from '../Studio3DViewerBabylon'
import EditModeToolbar from './EditModeToolbar'
import ComponentLibraryPanel from './ComponentLibraryPanel'
import PartSelector from './PartSelector'
import type { Component3D } from './ComponentLibraryPanel'

interface EditableStudio3DViewerProps {
  showGrid?: boolean
  viewMode?: 'solid' | 'wireframe' | 'normal' | 'uv'
  material?: {
    metalness: number
    roughness: number
    color: string
    wireframe: boolean
  }
  modelUrl?: string
  onGeometryUpdate?: (geometry: any) => void
  onScaleChange?: (scale: { x: number; y: number; z: number }) => void
  geometry?: any
  meshStats?: {
    vertexCount: number
    triangleCount: number
    boundingBox: {
      min: any
      max: any
      size: { x: number; y: number; z: number }
    } | null
  } | null
}

interface HistoryEntry {
  geometry: any
  timestamp: number
}

export default function EditableStudio3DViewer(props: EditableStudio3DViewerProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedFaces, setSelectedFaces] = useState<Set<number>>(new Set())
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Use geometry from props (managed by parent component)
  const currentGeometry = props.geometry
  
  // Component library state
  const [showComponentLibrary, setShowComponentLibrary] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<Component3D | null>(null)
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null)

  // Save to history
  const saveToHistory = useCallback((geometry: any) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({
        geometry: geometry,
        timestamp: Date.now(),
      })
      return newHistory
    })
    setHistoryIndex((prev) => prev + 1)
  }, [historyIndex])

  // Undo (local history, calls parent to apply)
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      const prevGeometry = history[historyIndex - 1].geometry
      props.onGeometryUpdate?.(prevGeometry)
    }
  }, [historyIndex, history, props])

  // Redo (local history, calls parent to apply)
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      const nextGeometry = history[historyIndex + 1].geometry
      props.onGeometryUpdate?.(nextGeometry)
    }
  }, [historyIndex, history, props])

  // Handle geometry loaded from viewer - pass to parent
  const handleGeometryLoaded = useCallback((geometry: any) => {
    saveToHistory(geometry)
    props.onGeometryUpdate?.(geometry)
  }, [saveToHistory, props])

  // Handle scale change from gizmo - pass to parent
  const handleScaleChange = useCallback((scale: { x: number; y: number; z: number }) => {
    props.onScaleChange?.(scale)
  }, [props])

  // Babylon.js operations
  const handleDelete = useCallback(() => {
    if (typeof window.babylonDeleteSelected === 'function') {
      window.babylonDeleteSelected()
    }
  }, [])

  const handleSmooth = useCallback(() => {
    if (typeof window.babylonSmoothMesh === 'function') {
      window.babylonSmoothMesh()
    }
  }, [])

  const handleExtrude = useCallback(() => {
    // Extrude operation - placeholder
  }, [])

  const handleHighlightParts = useCallback(() => {
    if (typeof window.babylonHighlightParts === 'function') {
      window.babylonHighlightParts()
    }
  }, [])

  const handleUnion = useCallback(() => {
    if (typeof window.babylonBooleanUnion === 'function') {
      window.babylonBooleanUnion()
    }
  }, [])

  const handleSubtract = useCallback(() => {
    if (typeof window.babylonBooleanSubtract === 'function') {
      window.babylonBooleanSubtract()
    }
  }, [])

  const handleIntersect = useCallback(() => {
    // Intersect operation - placeholder
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Main viewport - always full size */}
      <Studio3DViewerBabylon
        {...props}
        geometry={currentGeometry}
        onGeometryUpdate={handleGeometryLoaded}
        onScaleChange={handleScaleChange}
        isEditMode={isEditMode}
        selectedTool={selectedTool}
      />

      {/* Edit Mode Toolbar - overlays on left */}
      <EditModeToolbar
        isEditMode={isEditMode}
        onToggleEditMode={() => {
          setIsEditMode(!isEditMode)
          // Don't auto-show component library when entering edit mode
        }}
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        selectedCount={selectedFaces.size}
        onDelete={handleDelete}
        onSmooth={handleSmooth}
        onExtrude={handleExtrude}
        onHighlightParts={handleHighlightParts}
        booleanOps={{
          onUnion: handleUnion,
          onSubtract: handleSubtract,
          onIntersect: handleIntersect,
          canPerform: selectedPlacedId !== null,
        }}
      />

      {/* Component Library Panel - overlays on right */}
      {showComponentLibrary && (
        <div className="absolute top-0 right-0 w-80 h-full z-10">
          <ComponentLibraryPanel
            onComponentSelect={setSelectedComponent}
            selectedComponent={selectedComponent}
          />
        </div>
      )}
    </div>
  )
}
