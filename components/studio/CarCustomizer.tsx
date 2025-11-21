'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, PerspectiveCamera, TransformControls, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Suspense } from 'react'
import { useStudioStore } from '@/lib/store/studio-store'
import CarAssemblyView from './CarAssemblyView'

export default function CarCustomizer() {
  const { showGrid, viewMode, showMountPoints } = useStudioStore()

  return (
    <div className="w-full h-full relative bg-black">
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.3} color="#ef4444" />
          <spotLight
            position={[0, 15, 0]}
            angle={0.3}
            penumbra={1}
            intensity={0.5}
            castShadow
          />

          {/* Grid Floor */}
          {showGrid && (
            <Grid
              args={[50, 50]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#4a1a1a"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#ef4444"
              fadeDistance={100}
              fadeStrength={1}
              followCamera={false}
              position={[0, 0, 0]}
            />
          )}

          {/* Car Assembly */}
          <CarAssemblyView
            viewMode={viewMode}
            showMountPoints={showMountPoints}
          />

          {/* Camera Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={50}
            target={[0, 1, 0]}
          />

          {/* Camera */}
          <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />

          {/* Gizmo Helper */}
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport
              axisColors={['#ef4444', '#22c55e', '#3b82f6']}
              labelColor="white"
            />
          </GizmoHelper>
        </Suspense>
      </Canvas>

      {/* View Controls Overlay */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-3">
        <ViewControls />
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-xs font-mono">
        <AssemblyStats />
      </div>
    </div>
  )
}

function ViewControls() {
  const { viewMode, setViewMode, toggleGrid, toggleMountPoints, showGrid, showMountPoints } = useStudioStore()

  return (
    <div className="space-y-3">
      <div className="text-xs font-light text-gray-400 mb-2">View Mode</div>
      <div className="flex gap-2">
        {(['assembled', 'exploded', 'wireframe', 'xray'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === mode
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="pt-3 border-t border-white/10 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={toggleGrid}
            className="rounded border-gray-600 text-red-500"
          />
          Show Grid
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
          <input
            type="checkbox"
            checked={showMountPoints}
            onChange={toggleMountPoints}
            className="rounded border-gray-600 text-red-500"
          />
          Mount Points
        </label>
      </div>
    </div>
  )
}

function AssemblyStats() {
  const { currentAssembly } = useStudioStore()
  
  const partCount = Object.keys(currentAssembly.parts).length
  
  return (
    <div className="space-y-1">
      <div className="text-gray-400">Assembly: <span className="text-white">{currentAssembly.name}</span></div>
      <div className="text-gray-400">Parts: <span className="text-white">{partCount}</span></div>
      {currentAssembly.totalPrintTime && (
        <div className="text-gray-400">Print Time: <span className="text-white">{Math.round(currentAssembly.totalPrintTime / 60)}h</span></div>
      )}
      {currentAssembly.totalFilament && (
        <div className="text-gray-400">Filament: <span className="text-white">{currentAssembly.totalFilament}g</span></div>
      )}
    </div>
  )
}
