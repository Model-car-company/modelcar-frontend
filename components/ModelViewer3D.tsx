"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'

type ViewerProps = {
  modelUrl: string
  explode?: boolean
  explodeFactor?: number // 0..2
  className?: string
}

function ExplodableModel({ url, explode, explodeFactor = 0.8 }: { url: string; explode?: boolean; explodeFactor?: number }) {
  const { scene } = useGLTF(url)
  const [originals] = useState<{ mesh: THREE.Object3D; origin: THREE.Vector3; basePos: THREE.Vector3 }[]>([])

  useEffect(() => {
    // Cache base positions and centers once
    scene.traverse((obj) => {
      if ((obj as any).isMesh) {
        const mesh = obj as THREE.Mesh
        const bbox = new THREE.Box3().setFromObject(mesh)
        const center = new THREE.Vector3()
        bbox.getCenter(center)
        originals.push({ mesh, origin: center.clone(), basePos: mesh.position.clone() })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  useEffect(() => {
    // Apply explode offsets
    originals.forEach(({ mesh, origin, basePos }) => {
      const dir = origin.clone().normalize()
      const offset = explode ? dir.multiplyScalar(explodeFactor) : new THREE.Vector3(0, 0, 0)
      mesh.position.set(basePos.x + offset.x, basePos.y + offset.y, basePos.z + offset.z)
    })
  }, [explode, explodeFactor, originals])

  return <primitive object={scene} />
}

export default function ModelViewer3D({ modelUrl, explode = false, explodeFactor = 0.8, className }: ViewerProps) {
  const [dpr, setDpr] = useState(1.25)
  return (
    <div className={className}>
      <Canvas dpr={dpr} camera={{ fov: 45, position: [2.5, 1.8, 3.2] }}>
        <Suspense fallback={<Html center><div className="text-xs text-gray-400">Loading 3D…</div></Html>}>
          <group>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <ExplodableModel url={modelUrl} explode={explode} explodeFactor={explodeFactor} />
          </group>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  )
}

(useGLTF as any).preload && (useGLTF as any).preload('')
