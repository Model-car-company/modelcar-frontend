'use client'

import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'

// Fading trail made of multiple segments with decreasing opacity
function FadingTrail({ curve, speed = 1, delay = 0 }: {
    curve: THREE.QuadraticBezierCurve3,
    speed?: number,
    delay?: number
}) {
    const [progress, setProgress] = useState(delay % 1)
    const segmentCount = 12

    useFrame((state, delta) => {
        setProgress(prev => (prev + delta * speed * 0.2) % 1.4)
    })

    // Generate segments with fading opacity
    const segments = useMemo(() => {
        const segs: { points: THREE.Vector3[], opacity: number }[] = []
        const segmentLength = 0.08

        for (let i = 0; i < segmentCount; i++) {
            const startT = progress - (i * segmentLength * 0.4)
            const endT = startT - segmentLength

            if (startT > 0 && endT < 1 && startT <= 1) {
                const clampedStart = Math.min(Math.max(startT, 0), 1)
                const clampedEnd = Math.min(Math.max(endT, 0), 1)

                if (clampedStart > clampedEnd) {
                    const startPoint = curve.getPoint(clampedStart)
                    const endPoint = curve.getPoint(clampedEnd)

                    // Fade from bright (at head) to transparent (at tail)
                    const opacity = Math.pow(1 - (i / segmentCount), 2) * 0.9

                    segs.push({
                        points: [startPoint, endPoint],
                        opacity
                    })
                }
            }
        }
        return segs
    }, [progress, curve])

    return (
        <group>
            {segments.map((seg, i) => (
                <Line
                    key={i}
                    points={seg.points}
                    color="white"
                    lineWidth={1.2}
                    transparent
                    opacity={seg.opacity}
                />
            ))}
        </group>
    )
}

// Earth globe with night lights
function Globe() {
    const globeRef = useRef<THREE.Mesh>(null)
    const arcsRef = useRef<THREE.Group>(null)

    const earthTexture = useLoader(
        TextureLoader,
        'https://unpkg.com/three-globe/example/img/earth-night.jpg'
    )

    useFrame((state, delta) => {
        if (globeRef.current) {
            globeRef.current.rotation.y += delta * 0.05
        }
        if (arcsRef.current) {
            arcsRef.current.rotation.y += delta * 0.05
        }
    })

    const shippingCurves = useMemo(() => {
        const routes = [
            { from: [-118.25, 34.05], to: [-0.13, 51.51] },
            { from: [-118.25, 34.05], to: [139.69, 35.68] },
            { from: [-118.25, 34.05], to: [151.21, -33.87] },
            { from: [-118.25, 34.05], to: [13.41, 52.52] },
            { from: [-118.25, 34.05], to: [-74.01, 40.71] },
            { from: [-118.25, 34.05], to: [103.82, 1.35] },
            { from: [-118.25, 34.05], to: [2.35, 48.86] },
            { from: [-118.25, 34.05], to: [-46.63, -23.55] },
            { from: [-118.25, 34.05], to: [37.62, 55.75] },
            { from: [-118.25, 34.05], to: [121.47, 31.23] },
            { from: [-118.25, 34.05], to: [-99.13, 19.43] },
            { from: [-118.25, 34.05], to: [28.98, 41.01] },
            { from: [-118.25, 34.05], to: [55.27, 25.20] },
            { from: [-118.25, 34.05], to: [114.17, 22.32] },
            { from: [-74.01, 40.71], to: [-0.13, 51.51] },
            { from: [-74.01, 40.71], to: [2.35, 48.86] },
            { from: [-74.01, 40.71], to: [13.41, 52.52] },
            { from: [-74.01, 40.71], to: [-43.17, -22.91] },
            { from: [-0.13, 51.51], to: [55.27, 25.20] },
            { from: [-0.13, 51.51], to: [103.82, 1.35] },
            { from: [-0.13, 51.51], to: [37.62, 55.75] },
            { from: [139.69, 35.68], to: [103.82, 1.35] },
            { from: [139.69, 35.68], to: [121.47, 31.23] },
            { from: [139.69, 35.68], to: [151.21, -33.87] },
            { from: [103.82, 1.35], to: [151.21, -33.87] },
            { from: [103.82, 1.35], to: [55.27, 25.20] },
            { from: [55.27, 25.20], to: [77.21, 28.61] },
            { from: [2.35, 48.86], to: [37.62, 55.75] },
            { from: [-46.63, -23.55], to: [-0.13, 51.51] },
            { from: [121.47, 31.23], to: [-118.25, 34.05] },
        ]

        return routes.map(route => {
            const startLat = route.from[1] * Math.PI / 180
            const startLon = route.from[0] * Math.PI / 180
            const endLat = route.to[1] * Math.PI / 180
            const endLon = route.to[0] * Math.PI / 180

            const radius = 1.003

            const start = new THREE.Vector3(
                radius * Math.cos(startLat) * Math.cos(startLon),
                radius * Math.sin(startLat),
                radius * Math.cos(startLat) * Math.sin(startLon)
            )

            const end = new THREE.Vector3(
                radius * Math.cos(endLat) * Math.cos(endLon),
                radius * Math.sin(endLat),
                radius * Math.cos(endLat) * Math.sin(endLon)
            )

            const mid = start.clone().add(end).multiplyScalar(0.5)
            const arcHeight = start.distanceTo(end) * 0.2
            mid.normalize().multiplyScalar(radius + arcHeight)

            return new THREE.QuadraticBezierCurve3(start, mid, end)
        })
    }, [])

    return (
        <group scale={0.72}>
            <Sphere ref={globeRef} args={[1, 64, 64]}>
                <meshBasicMaterial map={earthTexture} />
            </Sphere>

            <group ref={arcsRef}>
                {shippingCurves.map((curve, i) => (
                    <FadingTrail
                        key={i}
                        curve={curve}
                        speed={0.6 + Math.random() * 0.4}
                        delay={Math.random()}
                    />
                ))}
            </group>
        </group>
    )
}

export default function ShippingGlobe() {
    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 1.9], fov: 45 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={1.2} />
                <Globe />
            </Canvas>
        </div>
    )
}
