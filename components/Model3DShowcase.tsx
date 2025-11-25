'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Center } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'

// Module-level path and preload for the featured model
// Note: encode space and parentheses in the URL path
const FEATURED_MODEL_PATH = '/3d-models/full/untitled.glb'
useGLTF.preload(FEATURED_MODEL_PATH)

function CompleteCarModel() {
  // Load the featured model from public/3d-models/full
  const { scene } = useGLTF(FEATURED_MODEL_PATH)
  
  return (
    <primitive object={scene} scale={3.5} />
  )
}

export default function Model3DShowcase() {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[8, 5, 12]} fov={60} />
        
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[15, 15, 10]} intensity={1.5} />
        <directionalLight position={[-15, -10, -10]} intensity={0.5} />
        <spotLight position={[0, 15, 0]} intensity={1} angle={0.4} />
        
        {/* Environment for reflections */}
        <Environment preset="studio" />
        
        {/* Complete Car Model */}
        <Suspense fallback={null}>
          {/* Center will recenter the model's bounding box at the origin */}
          <Center>
            <CompleteCarModel />
          </Center>
        </Suspense>
        
        {/* Controls */}
        <OrbitControls
          target={[0, 0, 0]}
          enablePan={false}
          minDistance={5}
          maxDistance={25}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  )
}
