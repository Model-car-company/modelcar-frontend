'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three-stdlib'

interface Studio3DViewerProps {
  showGrid?: boolean;
  viewMode?: 'solid' | 'wireframe' | 'normal' | 'uv';
  material?: {
    metalness: number;
    roughness: number;
    color: string;
    wireframe: boolean;
  };
  modelUrl?: string;
}

// STL Model Loader Component
function STLModel({ url, viewMode, material: materialProps }: { url: string; viewMode?: string; material?: any }) {
  const geom = useLoader(STLLoader, url)
  const meshRef = useRef<THREE.Mesh>(null)
  const [modelScale, setModelScale] = useState(1)
  
  useEffect(() => {
    if (geom) {
      // Center and scale the geometry
      geom.computeBoundingBox()
      const bbox = geom.boundingBox
      if (bbox) {
        const center = new THREE.Vector3()
        bbox.getCenter(center)
        
        // Center geometry
        geom.translate(-center.x, -bbox.min.y, -center.z)
        
        // Calculate scale to fit in viewport (target size: 4-6 units)
        const size = new THREE.Vector3()
        bbox.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        const targetSize = 5
        const scale = targetSize / maxDim
        setModelScale(scale)
        
        console.log('Model loaded:', {
          originalSize: size,
          maxDim,
          scale,
          bbox
        })
      }
    }
  }, [geom])
  
  return (
    <mesh 
      ref={meshRef} 
      geometry={geom} 
      scale={[modelScale, modelScale, modelScale]}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow 
      receiveShadow
    >
      <meshStandardMaterial
        color={materialProps?.color || '#808080'}
        metalness={materialProps?.metalness || 0.7}
        roughness={materialProps?.roughness || 0.3}
        wireframe={viewMode === 'wireframe'}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Just a reference cube for scale - small and subtle
function ReferenceCube() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#ef4444"
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
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ef4444" />
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
  material,
  modelUrl
}: Studio3DViewerProps) {
  return (
    <div className="w-full h-full relative bg-[#1a1a1a]">
      <Canvas shadows camera={{ position: [0, 8, 10], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <Lighting />
          
          {/* Load STL Model if URL provided */}
          {modelUrl ? (
            <STLModel url={modelUrl} viewMode={viewMode} material={material} />
          ) : (
            /* Reference Cube - small object for scale */
            <ReferenceCube />
          )}
          
          {/* Grid Floor - Only horizontal plane */}
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
          
          {/* Camera Controls - Infinite zoom */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={50}
            enablePan={true}
            enableRotate={true}
            enableZoom={true}
            target={[0, 0, 0]}
          />
          
          {/* Perspective camera - closer start */}
          <PerspectiveCamera makeDefault position={[0, 5, 8]} />
          
          {/* Axis Gizmo Helper */}
          <GizmoHelper
            alignment="bottom-right"
            margin={[80, 80]}
            renderPriority={1}
          >
            <group scale={0.75}>
              <GizmoViewport
                axisColors={['#ef4444', '#22c55e', '#3b82f6']}
                labelColor="white"
              />
            </group>
          </GizmoHelper>
        </Suspense>
      </Canvas>
      
      {/* Overlay Info */}
      <div className="absolute top-4 left-4 text-white text-xs font-mono">
        <div className="bg-black/50 backdrop-blur-sm p-2 rounded border border-red-500/20">
          <div>GRID: 50x50</div>
          <div>PLANE: HORIZONTAL</div>
          <div>ZOOM: 1-50</div>
        </div>
      </div>
    </div>
  )
}
