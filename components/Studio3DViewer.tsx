'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei'
import * as THREE from 'three'

interface Studio3DViewerProps {
  showGrid?: boolean;
  viewMode?: 'solid' | 'wireframe' | 'normal' | 'uv';
  material?: {
    metalness: number;
    roughness: number;
    color: string;
    wireframe: boolean;
  };
}

// Just a reference cube for scale - small and subtle
function ReferenceCube() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#8b5cf6"
        wireframe={true}
        transparent={true}
        opacity={0.3}
      />
    </mesh>
  )
}

// Lighting Setup
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
      />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
      />
    </>
  )
}

// Main Studio 3D Viewer
export default function Studio3DViewer({ 
  showGrid = true, 
  viewMode = 'wireframe',
  material
}: Studio3DViewerProps) {
  return (
    <div className="w-full h-full relative bg-[#1a1a1a]">
      <Canvas shadows camera={{ position: [0, 8, 10], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <Lighting />
          
          {/* Reference Cube - small object for scale */}
          <ReferenceCube />
          
          {/* Grid Floor - Only horizontal plane */}
          {showGrid && (
            <Grid
              args={[200, 200]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#2a2a2a"
              sectionSize={10}
              sectionThickness={1}
              sectionColor="#3a3a3a"
              fadeDistance={100}
              fadeStrength={1}
              followCamera={false}
              position={[0, 0, 0]}
            />
          )}
          
          {/* Camera Controls - Infinite zoom */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={Infinity}
            enablePan={true}
            enableRotate={true}
            enableZoom={true}
            target={[0, 0, 0]}
          />
          
          {/* Perspective camera - closer start */}
          <PerspectiveCamera makeDefault position={[0, 8, 10]} />
        </Suspense>
      </Canvas>
      
      {/* Overlay Info */}
      <div className="absolute top-4 left-4 text-white text-xs font-mono">
        <div className="bg-black/50 backdrop-blur-sm p-2 rounded border border-red-500/20">
          <div>GRID: 100x100</div>
          <div>PLANE: HORIZONTAL</div>
          <div>ZOOM: INFINITE</div>
        </div>
      </div>
    </div>
  )
}
