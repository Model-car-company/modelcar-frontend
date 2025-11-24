'use client'

import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  
  useEffect(() => {
    // Handle point clouds and meshes
    scene.traverse((child) => {
      if (child instanceof THREE.Points) {
        // Remove vertex colors from geometry
        if (child.geometry.attributes.color) {
          child.geometry.deleteAttribute('color')
        }
        
        // Dispose old material
        if (child.material) {
          (child.material as THREE.Material).dispose()
        }
        
        // Create brand new white material
        child.material = new THREE.PointsMaterial({
          size: 0.015,
          color: 0xffffff,
          sizeAttenuation: true,
          vertexColors: false
        })
      } else if (child instanceof THREE.Mesh) {
        // It's a mesh - ensure solid rendering
        if (child.geometry.index === null && child.geometry.attributes.position) {
          // Point cloud in mesh form - convert to Points
          const geometry = child.geometry
          // Remove vertex colors
          if (geometry.attributes.color) {
            geometry.deleteAttribute('color')
          }
          
          const pointsMaterial = new THREE.PointsMaterial({
            size: 0.015,
            sizeAttenuation: true,
            color: 0xffffff, // White
            vertexColors: false // Disable vertex colors
          })
          const points = new THREE.Points(geometry, pointsMaterial)
          points.position.copy(child.position)
          points.rotation.copy(child.rotation)
          points.scale.copy(child.scale)
          child.parent?.add(points)
          child.visible = false
        } else {
          // Regular mesh - force solid
          if (child.material) {
            const mat = Array.isArray(child.material) ? child.material[0] : child.material
            mat.wireframe = false
            mat.side = THREE.FrontSide
            mat.needsUpdate = true
          }
        }
      }
    })
  }, [scene])
  
  return (
    <primitive 
      object={scene} 
      scale={1.5}
      position={[0, 0, 0]}
    />
  )
}

interface CategoryModel3DProps {
  modelPath: string
}

export default function CategoryModel3D({ modelPath }: CategoryModel3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
        
        {/* Lighting - Brighter for white materials */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.6} />
        <spotLight position={[0, 10, 0]} intensity={1.2} />
        
        {/* Environment for reflections */}
        <Environment preset="studio" />
        
        {/* Model */}
        <Suspense fallback={null}>
          <Model url={modelPath} />
        </Suspense>
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  )
}
