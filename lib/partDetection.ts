import * as THREE from 'three'

/**
 * Car Part Detection & Segmentation System
 * Supports multiple detection methods:
 * 1. Geometric heuristics (position, normals, connectivity)
 * 2. Named mesh groups (GLB/GLTF metadata)
 * 3. AI-based segmentation (SAM-3D API)
 */

export interface CarPart {
  id: string
  name: string
  type: 'wheel' | 'door' | 'hood' | 'roof' | 'bumper' | 'window' | 'mirror' | 'other'
  faceIndices: number[]
  vertices: THREE.Vector3[]
  center: THREE.Vector3
  boundingBox: THREE.Box3
  color?: string // For highlighting
}

export class PartDetector {
  private geometry: THREE.BufferGeometry
  private parts: Map<string, CarPart> = new Map()

  constructor(geometry: THREE.BufferGeometry) {
    this.geometry = geometry
  }

  /**
   * Method 1: Detect parts using geometric heuristics
   * Analyzes position, connectivity, and shape to identify parts
   */
  detectByGeometry(): CarPart[] {
    const position = this.geometry.attributes.position
    const faces = this.extractFaces()
    const clusters = this.clusterFacesByConnectivity(faces)
    
    const parts: CarPart[] = []
    
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i]
      const part = this.analyzeCluster(cluster, i)
      parts.push(part)
      this.parts.set(part.id, part)
    }
    
    return parts
  }

  /**
   * Method 2: Extract parts from named mesh groups (GLB/GLTF)
   * Reads userData or group names from the 3D model
   */
  detectFromMetadata(object: THREE.Object3D): CarPart[] {
    const parts: CarPart[] = []
    
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name) {
        const part = this.createPartFromMesh(child)
        if (part) {
          parts.push(part)
          this.parts.set(part.id, part)
        }
      }
    })
    
    return parts
  }

  /**
   * Method 3: AI-based segmentation using SAM-3D
   * Sends geometry to AI API for intelligent part detection
   */
  async detectWithAI(): Promise<CarPart[]> {
    try {
      // Convert geometry to point cloud
      const pointCloud = this.geometryToPointCloud()
      
      // Call SAM-3D API (example - replace with actual endpoint)
      const response = await fetch('/api/segment-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: pointCloud,
          task: 'car_part_segmentation'
        })
      })
      
      const { segments } = await response.json()
      
      // Convert API response to CarPart objects
      return segments.map((seg: any) => ({
        id: seg.id,
        name: seg.label,
        type: this.classifyPartType(seg.label),
        faceIndices: seg.faces,
        vertices: seg.vertices.map((v: number[]) => new THREE.Vector3(v[0], v[1], v[2])),
        center: new THREE.Vector3(...seg.center),
        boundingBox: new THREE.Box3(),
        color: this.getColorForType(this.classifyPartType(seg.label))
      }))
    } catch {
      return []
    }
  }

  /**
   * Smart selection: Click a face, select entire part
   */
  selectPartByFace(faceIndex: number): CarPart | null {
    const partsArray = Array.from(this.parts.values())
    for (const part of partsArray) {
      if (part.faceIndices.includes(faceIndex)) {
        return part
      }
    }
    return null
  }

  /**
   * Highlight a part with color
   */
  highlightPart(partId: string, color: THREE.Color): THREE.BufferGeometry {
    const part = this.parts.get(partId)
    if (!part) return this.geometry

    // Create color attribute if doesn't exist
    const colors = new Float32Array(this.geometry.attributes.position.count * 3)
    
    // Set colors for part faces
    for (const faceIdx of part.faceIndices) {
      const i1 = faceIdx * 3
      const i2 = faceIdx * 3 + 1
      const i3 = faceIdx * 3 + 2
      
      colors[i1 * 3] = color.r
      colors[i1 * 3 + 1] = color.g
      colors[i1 * 3 + 2] = color.b
      
      colors[i2 * 3] = color.r
      colors[i2 * 3 + 1] = color.g
      colors[i2 * 3 + 2] = color.b
      
      colors[i3 * 3] = color.r
      colors[i3 * 3 + 1] = color.g
      colors[i3 * 3 + 2] = color.b
    }
    
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return this.geometry
  }

  // ============ PRIVATE HELPER METHODS ============

  private extractFaces(): number[][] {
    const index = this.geometry.index
    const faces: number[][] = []
    
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        faces.push([index.getX(i), index.getX(i + 1), index.getX(i + 2)])
      }
    }
    
    return faces
  }

  private clusterFacesByConnectivity(faces: number[][]): number[][][] {
    // Group connected faces together
    // This is a simplified version - you'd want more sophisticated clustering
    const clusters: number[][][] = []
    const visited = new Set<number>()
    
    for (let i = 0; i < faces.length; i++) {
      if (visited.has(i)) continue
      
      const cluster: number[][] = []
      this.expandCluster(faces, i, visited, cluster)
      clusters.push(cluster)
    }
    
    return clusters
  }

  private expandCluster(faces: number[][], faceIdx: number, visited: Set<number>, cluster: number[][]) {
    if (visited.has(faceIdx)) return
    
    visited.add(faceIdx)
    cluster.push(faces[faceIdx])
    
    // Find adjacent faces (shares edge)
    const face = faces[faceIdx]
    for (let i = 0; i < faces.length; i++) {
      if (visited.has(i)) continue
      if (this.facesShareEdge(face, faces[i])) {
        this.expandCluster(faces, i, visited, cluster)
      }
    }
  }

  private facesShareEdge(face1: number[], face2: number[]): boolean {
    let shared = 0
    for (const v1 of face1) {
      if (face2.includes(v1)) shared++
    }
    return shared >= 2
  }

  private analyzeCluster(cluster: number[][], index: number): CarPart {
    const vertices: THREE.Vector3[] = []
    const position = this.geometry.attributes.position
    
    // Extract vertices
    for (const face of cluster) {
      for (const vIdx of face) {
        vertices.push(new THREE.Vector3(
          position.getX(vIdx),
          position.getY(vIdx),
          position.getZ(vIdx)
        ))
      }
    }
    
    // Calculate bounding box and center
    const bbox = new THREE.Box3().setFromPoints(vertices)
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    
    // Classify part type based on position and shape
    const type = this.classifyByPosition(center, bbox)
    
    return {
      id: `part_${index}`,
      name: `${type}_${index}`,
      type,
      faceIndices: Array.from({ length: cluster.length }, (_, i) => i),
      vertices,
      center,
      boundingBox: bbox,
      color: this.getColorForType(type)
    }
  }

  private classifyByPosition(center: THREE.Vector3, bbox: THREE.Box3): CarPart['type'] {
    const size = new THREE.Vector3()
    bbox.getSize(size)
    
    // Simple heuristics (improve these for your specific models)
    if (Math.abs(center.x) > 0.8 && center.y < 0 && size.y < size.x) {
      return 'wheel'
    }
    if (Math.abs(center.x) > 0.5 && Math.abs(center.z) < 0.5) {
      return 'door'
    }
    if (center.y > 0.5 && size.z > size.y) {
      return 'roof'
    }
    if (center.z > 1.5 || center.z < -1.5) {
      return 'bumper'
    }
    if (center.y > 0 && size.y < 0.2) {
      return 'hood'
    }
    
    return 'other'
  }

  private createPartFromMesh(mesh: THREE.Mesh): CarPart | null {
    const geometry = mesh.geometry as THREE.BufferGeometry
    if (!geometry) return null
    
    const position = geometry.attributes.position
    const vertices: THREE.Vector3[] = []
    
    for (let i = 0; i < position.count; i++) {
      vertices.push(new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      ))
    }
    
    const bbox = new THREE.Box3().setFromPoints(vertices)
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    
    const type = this.classifyPartType(mesh.name)
    
    return {
      id: mesh.uuid,
      name: mesh.name,
      type,
      faceIndices: [],
      vertices,
      center,
      boundingBox: bbox,
      color: this.getColorForType(type)
    }
  }

  private classifyPartType(name: string): CarPart['type'] {
    const lower = name.toLowerCase()
    if (lower.includes('wheel') || lower.includes('tire')) return 'wheel'
    if (lower.includes('door')) return 'door'
    if (lower.includes('hood') || lower.includes('bonnet')) return 'hood'
    if (lower.includes('roof')) return 'roof'
    if (lower.includes('bumper')) return 'bumper'
    if (lower.includes('window') || lower.includes('glass')) return 'window'
    if (lower.includes('mirror')) return 'mirror'
    return 'other'
  }

  private geometryToPointCloud(): number[][] {
    const position = this.geometry.attributes.position
    const points: number[][] = []
    
    for (let i = 0; i < position.count; i++) {
      points.push([
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      ])
    }
    
    return points
  }

  private getColorForType(type: CarPart['type']): string {
    const colors: Record<CarPart['type'], string> = {
      wheel: '#3b82f6',      // Blue
      door: '#10b981',       // Green
      hood: '#f59e0b',       // Amber
      roof: '#8b5cf6',       // Purple
      bumper: '#ef4444',     // Red
      window: '#06b6d4',     // Cyan
      mirror: '#ec4899',     // Pink
      other: '#6b7280'       // Gray
    }
    return colors[type]
  }

  getParts(): CarPart[] {
    return Array.from(this.parts.values())
  }

  getPartById(id: string): CarPart | undefined {
    return this.parts.get(id)
  }
}

/**
 * Quick usage example:
 * 
 * const detector = new PartDetector(geometry)
 * 
 * // Method 1: Geometric detection
 * const parts = detector.detectByGeometry()
 * 
 * // Method 2: From GLB metadata
 * const parts = detector.detectFromMetadata(loadedModel)
 * 
 * // Method 3: AI detection
 * const parts = await detector.detectWithAI()
 * 
 * // Select part by clicking
 * const part = detector.selectPartByFace(clickedFaceIndex)
 * if (part) {
 *   detector.highlightPart(part.id, new THREE.Color(0xff0000))
 * }
 */
