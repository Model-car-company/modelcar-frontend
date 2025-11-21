'use client'

import { Suspense, useMemo, useEffect, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Grid, Center, useGLTF, Stage } from '@react-three/drei'
import { Loader2 } from 'lucide-react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

interface Model3DViewerProps {
  modelUrl?: string;
  type?: 'stl' | 'obj' | 'glb';
  modelId?: string;
}

// STL Model Loader Component
function STLModel({ url }: { url: string }) {
  try {
    const geometry = useLoader(STLLoader, url)
    
    // Center and scale the geometry
    useEffect(() => {
      if (geometry) {
        geometry.center()
        geometry.computeBoundingBox()
        const box = geometry.boundingBox!
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 5 / maxDim // Scale to fit in view
        geometry.scale(scale, scale, scale)
      }
    }, [geometry])
    
    return (
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
    )
  } catch (error) {
    console.error('Failed to load STL:', error)
    return <FallbackCarModel />
  }
}

// Fallback car model (when STL fails to load)
function FallbackCarModel() {
  // This is the previous car model as fallback
  
  const carMesh = useMemo(() => {
    const group = new THREE.Group();
    
    // Car body (main chassis)
    const bodyGeometry = new THREE.BoxGeometry(4, 0.8, 1.8);
    bodyGeometry.translate(0, 0.4, 0);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: '#1a1a1a',
      metalness: 0.9,
      roughness: 0.2,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(bodyMesh);
    
    // Car roof/cabin
    const cabinGeometry = new THREE.BoxGeometry(2, 0.6, 1.4);
    cabinGeometry.translate(0.3, 0.9, 0);
    const cabinMaterial = new THREE.MeshStandardMaterial({ 
      color: '#0a0a0a',
      metalness: 0.3,
      roughness: 0.7,
      opacity: 0.8,
      transparent: true
    });
    const cabinMesh = new THREE.Mesh(cabinGeometry, cabinMaterial);
    group.add(cabinMesh);
    
    // Hood slope
    const hoodGeometry = new THREE.BoxGeometry(1.5, 0.3, 1.6);
    hoodGeometry.translate(-1.5, 0.6, 0);
    hoodGeometry.rotateZ(-0.15);
    const hoodMesh = new THREE.Mesh(hoodGeometry, bodyMaterial);
    group.add(hoodMesh);
    
    // Rear spoiler
    const spoilerGeometry = new THREE.BoxGeometry(0.1, 0.3, 1.2);
    spoilerGeometry.translate(2.1, 1.2, 0);
    const spoilerMaterial = new THREE.MeshStandardMaterial({ 
      color: '#ff0000',
      metalness: 0.8,
      roughness: 0.3,
    });
    const spoilerMesh = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
    group.add(spoilerMesh);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
      color: '#333333',
      metalness: 0.8,
      roughness: 0.3,
    });
    
    // Wheel rims
    const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.31, 8);
    const rimMaterial = new THREE.MeshStandardMaterial({ 
      color: '#cccccc',
      metalness: 1,
      roughness: 0.1,
    });
    
    const wheelPositions = [
      [-1.3, 0, 0.9],  // Front left
      [-1.3, 0, -0.9], // Front right
      [1.3, 0, 0.9],   // Rear left
      [1.3, 0, -0.9],  // Rear right
    ];
    
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      group.add(wheel);
      
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(x, y, z);
      group.add(rim);
    });
    
    // Headlights
    const headlightGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.3);
    const headlightMaterial = new THREE.MeshStandardMaterial({ 
      color: '#ffffff',
      emissive: '#ffffff',
      emissiveIntensity: 0.5,
    });
    
    const headlightLeft = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlightLeft.position.set(-2.05, 0.5, 0.5);
    group.add(headlightLeft);
    
    const headlightRight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlightRight.position.set(-2.05, 0.5, -0.5);
    group.add(headlightRight);
    
    // Side vents/details
    const ventGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.2);
    const ventMaterial = new THREE.MeshStandardMaterial({ 
      color: '#000000',
      metalness: 0,
      roughness: 1,
    });
    
    [-0.5, 0, 0.5, 1].forEach((x) => {
      const vent = new THREE.Mesh(ventGeometry, ventMaterial);
      vent.position.set(x, 0.5, 0.95);
      group.add(vent);
      
      const vent2 = new THREE.Mesh(ventGeometry, ventMaterial);
      vent2.position.set(x, 0.5, -0.95);
      group.add(vent2);
    });
    
    return group;
  }, []);
  
  return <primitive object={carMesh} scale={0.5} />;
}

// Main component that tries to load STL first, falls back to generated model
function CarModel({ modelUrl, modelId }: { modelUrl?: string; modelId?: string }) {
  const [hasError, setHasError] = useState(false)
  
  // If we have a real STL URL and no error, try to load it
  if (modelUrl && !hasError && (modelUrl.endsWith('.stl') || modelUrl.endsWith('.STL'))) {
    return (
      <Suspense fallback={<FallbackCarModel />}>
        <STLModel url={modelUrl} />
      </Suspense>
    )
  }
  
  // Otherwise use the generated model
  return <FallbackCarModel />
}

export default function Model3DViewer({ modelUrl, type = 'glb', modelId }: Model3DViewerProps) {
  return (
    <div className="w-full h-full min-h-[400px] relative bg-black rounded-sm overflow-hidden">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin opacity-40" />
        </div>
      }>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {/* Environment for reflections */}
          <Environment preset="studio" />
          
          {/* Car Model - will load STL if available, otherwise shows fallback */}
          <Center>
            <CarModel modelUrl={modelUrl} modelId={modelId} />
          </Center>
          
          {/* Grid floor */}
          <Grid 
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#1a1a1a"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#0a0a0a"
            fadeDistance={20}
            fadeStrength={1}
            followCamera={false}
            position={[0, -1.5, 0]}
          />
        </Canvas>
      </Suspense>
      
      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 text-[10px] font-extralight text-gray-500">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
