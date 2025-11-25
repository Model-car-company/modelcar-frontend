'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Center } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'

// Landing page 3D model path
const LANDING_MODEL_PATH = '/landing/base.glb'
useGLTF.preload(LANDING_MODEL_PATH)

function LandingCarModel() {
  const { scene } = useGLTF(LANDING_MODEL_PATH)
  
  return (
    <primitive object={scene} scale={2.5} />
  )
}

export default function Landing3DViewer() {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 3, 8]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <directionalLight position={[-10, -5, -5]} intensity={0.4} />
        <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.3} />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          <Center>
            <LandingCarModel />
          </Center>
        </Suspense>
        
        {/* Controls */}
        <OrbitControls
          target={[0, 0, 0]}
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}
