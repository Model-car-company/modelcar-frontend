'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStudioStore } from '@/lib/store/studio-store'
import * as THREE from 'three'
import { MountPoint } from '@/lib/types/car-parts'

interface CarAssemblyViewProps {
  viewMode: 'assembled' | 'exploded' | 'wireframe' | 'xray'
  showMountPoints: boolean
}

export default function CarAssemblyView({ viewMode, showMountPoints }: CarAssemblyViewProps) {
  const { currentAssembly } = useStudioStore()
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef}>
      {/* Render each part */}
      {Object.entries(currentAssembly.parts).map(([category, part]) => {
        if (!part) return null
        
        return (
          <CarPart
            key={part.id}
            part={part}
            viewMode={viewMode}
            showMountPoints={showMountPoints}
            exploded={viewMode === 'exploded'}
          />
        )
      })}
    </group>
  )
}

interface CarPartProps {
  part: any
  viewMode: 'assembled' | 'exploded' | 'wireframe' | 'xray'
  showMountPoints: boolean
  exploded: boolean
}

function CarPart({ part, viewMode, showMountPoints, exploded }: CarPartProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { currentAssembly } = useStudioStore()
  
  // For now, just render a placeholder box until we have real models
  // TODO: Load actual 3D models with useGLTF(part.meshUrl)
  
  // Get modifications for this part
  const modification = currentAssembly.modifications?.find(m => m.partId === part.id)
  
  // Calculate exploded position
  const explodedOffset = exploded ? getExplodedOffset(part.category) : [0, 0, 0]
  
  useEffect(() => {
    if (meshRef.current) {
      // Apply modifications
      if (modification) {
        if (modification.scale) {
          meshRef.current.scale.set(...modification.scale)
        }
        if (modification.rotation) {
          meshRef.current.rotation.set(...modification.rotation)
        }
        if (modification.position) {
          meshRef.current.position.set(...modification.position)
        }
      }
      
      // Apply view mode materials
      meshRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          switch (viewMode) {
            case 'wireframe':
              child.material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: '#ef4444'
              })
              break
            case 'xray':
              child.material = new THREE.MeshPhysicalMaterial({
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide,
                color: '#3b82f6'
              })
              break
            default:
              // Use default materials
              break
          }
        }
      })
    }
  }, [modification, viewMode])
  
  // Animate exploded view
  useFrame(() => {
    if (meshRef.current && exploded) {
      meshRef.current.position.lerp(
        new THREE.Vector3(...explodedOffset),
        0.1
      )
    } else if (meshRef.current) {
      meshRef.current.position.lerp(
        new THREE.Vector3(
          modification?.position?.[0] || 0,
          modification?.position?.[1] || 0,
          modification?.position?.[2] || 0
        ),
        0.1
      )
    }
  })
  
  // Render placeholder mesh (will be replaced with actual 3D models later)
  const color = viewMode === 'wireframe' ? '#ef4444' : viewMode === 'xray' ? '#3b82f6' : '#8b8b8b'
  const wireframe = viewMode === 'wireframe'
  const transparent = viewMode === 'xray'
  const opacity = viewMode === 'xray' ? 0.3 : 1
  
  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 0.5, 2]} />
        <meshStandardMaterial 
          color={color} 
          wireframe={wireframe}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
      
      {/* Render mount points */}
      {showMountPoints && part.mountingPoints?.map((mp: MountPoint, i: number) => (
        <MountPointMarker key={i} mountPoint={mp} />
      ))}
    </group>
  )
}

function MountPointMarker({ mountPoint }: { mountPoint: MountPoint }) {
  return (
    <group position={mountPoint.position}>
      {/* Sphere marker */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
      </mesh>
      
      {/* Normal direction indicator */}
      <arrowHelper
        args={[
          new THREE.Vector3(...mountPoint.normal),
          new THREE.Vector3(0, 0, 0),
          0.2,
          0xef4444
        ]}
      />
    </group>
  )
}

// Calculate exploded position based on category
function getExplodedOffset(category: string): [number, number, number] {
  const offsets: Record<string, [number, number, number]> = {
    body: [0, 0, 0],
    wheels: [0, -1, 0],
    interior: [0, 2, 0],
    engine: [2, 0, 0],
    frame: [0, -0.5, 0],
    accessories: [0, 1, 0],
    lights: [-1, 0, 0],
    spoiler: [0, 0.5, 1],
    exhaust: [0, 0, -1],
  }
  
  return offsets[category] || [0, 0, 0]
}

// TODO: Preload common models when we have actual 3D files
// useGLTF.preload('/models/sample-body.glb')
// useGLTF.preload('/models/sample-wheel.glb')
