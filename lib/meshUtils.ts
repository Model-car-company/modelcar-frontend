import * as THREE from 'three'

/**
 * Mesh manipulation utilities using Manifold-3d
 * For smoothing, repair, and mesh optimization operations
 */

/**
 * Smooth mesh using Laplacian smoothing
 * @param geometry - THREE.BufferGeometry to smooth
 * @param strength - Smoothing strength (0-100)
 * @param iterations - Number of smoothing passes
 */
export function smoothMesh(
  geometry: THREE.BufferGeometry,
  strength: number = 50,
  iterations: number = 2
): THREE.BufferGeometry {
  const newGeometry = geometry.clone()
  const positionAttribute = newGeometry.getAttribute('position')
  
  if (!positionAttribute) {
    return geometry.clone()
  }
  
  const positions = new Float32Array(positionAttribute.array)
  const vertexCount = positions.length / 3

  // Build adjacency list for Laplacian smoothing
  const adjacency: Map<number, Set<number>> = new Map()
  const indexAttribute = newGeometry.index
  
  if (indexAttribute) {
    const indices = indexAttribute.array
    for (let i = 0; i < indices.length; i += 3) {
      const v0 = indices[i]
      const v1 = indices[i + 1]
      const v2 = indices[i + 2]
      
      if (!adjacency.has(v0)) adjacency.set(v0, new Set())
      if (!adjacency.has(v1)) adjacency.set(v1, new Set())
      if (!adjacency.has(v2)) adjacency.set(v2, new Set())
      
      adjacency.get(v0)!.add(v1)
      adjacency.get(v0)!.add(v2)
      adjacency.get(v1)!.add(v0)
      adjacency.get(v1)!.add(v2)
      adjacency.get(v2)!.add(v0)
      adjacency.get(v2)!.add(v1)
    }
  } else {
    console.warn('No index buffer - smoothing may be limited')
  }

  // Normalize strength (0-1 range, but limit to 0.5 max for stability)
  const lambda = Math.min(strength / 100, 0.5)

  // Perform Laplacian smoothing iterations
  for (let iter = 0; iter < iterations; iter++) {
    const newPositions = new Float32Array(positions.length)
    
    for (let v = 0; v < vertexCount; v++) {
      const neighbors = adjacency.get(v)
      
      if (!neighbors || neighbors.size === 0) {
        // Keep original position if no neighbors
        newPositions[v * 3] = positions[v * 3]
        newPositions[v * 3 + 1] = positions[v * 3 + 1]
        newPositions[v * 3 + 2] = positions[v * 3 + 2]
        continue
      }

      // Calculate average position of neighbors
      let avgX = 0, avgY = 0, avgZ = 0
      
      neighbors.forEach(n => {
        avgX += positions[n * 3]
        avgY += positions[n * 3 + 1]
        avgZ += positions[n * 3 + 2]
      })
      
      const count = neighbors.size
      avgX /= count
      avgY /= count
      avgZ /= count

      // Blend between original and average position
      newPositions[v * 3] = positions[v * 3] * (1 - lambda) + avgX * lambda
      newPositions[v * 3 + 1] = positions[v * 3 + 1] * (1 - lambda) + avgY * lambda
      newPositions[v * 3 + 2] = positions[v * 3 + 2] * (1 - lambda) + avgZ * lambda
    }

    // Copy smoothed positions back for next iteration
    for (let i = 0; i < positions.length; i++) {
      positions[i] = newPositions[i]
    }
  }

  // Update geometry with smoothed positions
  newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  newGeometry.computeVertexNormals()
  newGeometry.computeBoundingBox()
  newGeometry.computeBoundingSphere()
  
  return newGeometry
}

/**
 * Repair mesh by fixing normals and validating geometry
 * @param geometry - THREE.BufferGeometry to repair
 */
export function repairMesh(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const newGeometry = geometry.clone()
  
  try {
    // Simply recompute normals - safest repair operation
    newGeometry.computeVertexNormals()
    
    // Recompute bounding volumes
    newGeometry.computeBoundingBox()
    newGeometry.computeBoundingSphere()
    
    // Validate geometry has required attributes
    if (!newGeometry.getAttribute('position')) {
      throw new Error('Geometry missing position attribute')
    }
    
    return newGeometry
  } catch (error) {
    // Return original if repair fails
    return geometry.clone()
  }
}

/**
 * Subdivide mesh for higher resolution
 * @param geometry - THREE.BufferGeometry to subdivide
 * @param levels - Number of subdivision levels
 */
export function subdivideMesh(geometry: THREE.BufferGeometry, levels: number = 1): THREE.BufferGeometry {
  let currentGeometry = geometry.clone()
  
  for (let level = 0; level < levels; level++) {
    const positions = currentGeometry.getAttribute('position').array as Float32Array
    const indices = currentGeometry.index?.array
    
    if (!indices) continue
    
    const newPositions: number[] = []
    const newIndices: number[] = []
    const edgeMap = new Map<string, number>()
    
    // Copy original vertices
    for (let i = 0; i < positions.length; i++) {
      newPositions.push(positions[i])
    }
    
    // Subdivide each triangle
    for (let i = 0; i < indices.length; i += 3) {
      const v0 = indices[i]
      const v1 = indices[i + 1]
      const v2 = indices[i + 2]
      
      // Get midpoint indices (create if not exists)
      const m01 = getMidpoint(v0, v1, positions, newPositions, edgeMap)
      const m12 = getMidpoint(v1, v2, positions, newPositions, edgeMap)
      const m20 = getMidpoint(v2, v0, positions, newPositions, edgeMap)
      
      // Create 4 new triangles
      newIndices.push(v0, m01, m20)
      newIndices.push(v1, m12, m01)
      newIndices.push(v2, m20, m12)
      newIndices.push(m01, m12, m20)
    }
    
    currentGeometry = new THREE.BufferGeometry()
    currentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3))
    currentGeometry.setIndex(newIndices)
    currentGeometry.computeVertexNormals()
  }
  
  return currentGeometry
}

function getMidpoint(
  v0: number,
  v1: number,
  positions: Float32Array,
  newPositions: number[],
  edgeMap: Map<string, number>
): number {
  const key = v0 < v1 ? `${v0},${v1}` : `${v1},${v0}`
  
  if (edgeMap.has(key)) {
    return edgeMap.get(key)!
  }
  
  const midpoint = [
    (positions[v0 * 3] + positions[v1 * 3]) / 2,
    (positions[v0 * 3 + 1] + positions[v1 * 3 + 1]) / 2,
    (positions[v0 * 3 + 2] + positions[v1 * 3 + 2]) / 2,
  ]
  
  const index = newPositions.length / 3
  newPositions.push(...midpoint)
  edgeMap.set(key, index)
  
  return index
}
