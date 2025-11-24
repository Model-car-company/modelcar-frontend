'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'

function CompleteCarModel() {
  const { scene } = useGLTF('/3d-models/4f77e996-a7d5-4a03-8067-e0b12a7d6d00_white_mesh.glb')
  
  return (
    <primitive 
      object={scene} 
      scale={3.5}
      position={[0, -0.8, 0]}
    />
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
          <CompleteCarModel />
        </Suspense>
        
        {/* Controls */}
        <OrbitControls
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
