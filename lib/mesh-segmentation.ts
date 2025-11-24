import * as BABYLON from 'babylonjs'

/**
 * Mesh Segmentation Utility
 * Automatically identifies and separates car parts from a single mesh
 */

export interface CarPart {
  name: string
  mesh: BABYLON.Mesh
  type: 'body' | 'wheel' | 'door' | 'hood' | 'trunk' | 'spoiler' | 'mirror' | 'bumper' | 'window' | 'other'
  bounds: BABYLON.BoundingBox
  vertices: number
}

export class MeshSegmenter {
  private scene: BABYLON.Scene
  private originalMesh: BABYLON.Mesh
  private parts: Map<string, CarPart> = new Map()

  constructor(scene: BABYLON.Scene, mesh: BABYLON.Mesh) {
    this.scene = scene
    this.originalMesh = mesh
  }

  /**
   * Segment the mesh into individual car parts
   */
  async segmentMesh(): Promise<CarPart[]> {
    // Step 1: Analyze mesh geometry
    const positions = this.originalMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)
    const indices = this.originalMesh.getIndices()
    
    if (!positions || !indices) {
      return []
    }

    // Step 2: Identify connected components
    const components = this.findConnectedComponents(positions, Array.from(indices))

    // Step 3: Classify each component as a car part
    const parts: CarPart[] = []
    components.forEach((component, index) => {
      const partMesh = this.createMeshFromComponent(component, index)
      const partType = this.classifyCarPart(partMesh)
      
      const part: CarPart = {
        name: `${partType}_${index}`,
        mesh: partMesh,
        type: partType,
        bounds: partMesh.getBoundingInfo().boundingBox,
        vertices: component.vertices.length / 3
      }
      
      parts.push(part)
      this.parts.set(part.name, part)
    })

    // Step 4: Special handling for wheels (they're usually similar in size and shape)
    this.identifyWheels(parts)
    
    // Step 5: Identify body panels and doors
    this.identifyBodyPanels(parts)

    return parts
  }

  /**
   * Find connected components in the mesh
   */
  private findConnectedComponents(
    positions: Float32Array | number[], 
    indices: Uint16Array | Uint32Array | number[]
  ): Array<{vertices: number[], indices: number[]}> {
    const vertexCount = positions.length / 3
    const visited = new Array(vertexCount).fill(false)
    const components = []
    
    // Build adjacency list
    const adjacency = new Map<number, Set<number>>()
    for (let i = 0; i < indices.length; i += 3) {
      const v1 = indices[i]
      const v2 = indices[i + 1]
      const v3 = indices[i + 2]
      
      // Add edges
      this.addEdge(adjacency, v1, v2)
      this.addEdge(adjacency, v2, v3)
      this.addEdge(adjacency, v3, v1)
    }
    
    // Find components using DFS
    for (let v = 0; v < vertexCount; v++) {
      if (!visited[v]) {
        const component = this.dfs(v, visited, adjacency, positions, indices)
        if (component.vertices.length > 0) {
          components.push(component)
        }
      }
    }
    
    // If only one component found, try to segment by geometric features
    if (components.length === 1) {
      return this.segmentByGeometry(positions, indices)
    }
    
    return components
  }

  private addEdge(adjacency: Map<number, Set<number>>, v1: number, v2: number) {
    if (!adjacency.has(v1)) adjacency.set(v1, new Set())
    if (!adjacency.has(v2)) adjacency.set(v2, new Set())
    adjacency.get(v1)!.add(v2)
    adjacency.get(v2)!.add(v1)
  }

  private dfs(
    start: number, 
    visited: boolean[], 
    adjacency: Map<number, Set<number>>,
    positions: Float32Array | number[],
    indices: Uint16Array | Uint32Array | number[]
  ): {vertices: number[], indices: number[]} {
    const stack = [start]
    const componentVertices = new Set<number>()
    
    while (stack.length > 0) {
      const v = stack.pop()!
      if (visited[v]) continue
      
      visited[v] = true
      componentVertices.add(v)
      
      const neighbors = adjacency.get(v)
      if (neighbors) {
        neighbors.forEach(n => {
          if (!visited[n]) stack.push(n)
        })
      }
    }
    
    // Extract vertex positions and remap indices
    const vertexMap = new Map<number, number>()
    const newVertices: number[] = []
    let newIndex = 0
    
    componentVertices.forEach(v => {
      vertexMap.set(v, newIndex++)
      newVertices.push(
        positions[v * 3],
        positions[v * 3 + 1],
        positions[v * 3 + 2]
      )
    })
    
    // Find indices that belong to this component
    const newIndices: number[] = []
    for (let i = 0; i < indices.length; i += 3) {
      if (componentVertices.has(indices[i]) && 
          componentVertices.has(indices[i + 1]) && 
          componentVertices.has(indices[i + 2])) {
        newIndices.push(
          vertexMap.get(indices[i])!,
          vertexMap.get(indices[i + 1])!,
          vertexMap.get(indices[i + 2])!
        )
      }
    }
    
    return { vertices: newVertices, indices: newIndices }
  }

  /**
   * Segment by geometric features when mesh is a single component
   */
  private segmentByGeometry(
    positions: Float32Array | number[], 
    indices: Uint16Array | Uint32Array | number[]
  ): Array<{vertices: number[], indices: number[]}> {
    const components = []
    
    // Strategy 1: Detect wheels (circular patterns)
    const wheels = this.detectWheelGeometry(positions, indices)
    components.push(...wheels)
    
    // Strategy 2: Detect flat surfaces (doors, hood, trunk)
    const panels = this.detectPanels(positions, indices)
    components.push(...panels)
    
    // Strategy 3: Remaining geometry becomes the body
    const body = this.extractRemainingGeometry(positions, indices, components)
    if (body.vertices.length > 0) {
      components.push(body)
    }
    
    return components.length > 1 ? components : [{
      vertices: Array.from(positions),
      indices: Array.from(indices)
    }]
  }

  private detectWheelGeometry(
    positions: Float32Array | number[], 
    indices: Uint16Array | Uint32Array | number[]
  ): Array<{vertices: number[], indices: number[]}> {
    const wheels: Array<{vertices: number[], indices: number[]}> = []
    
    // Look for circular patterns
    // Wheels typically have:
    // - Circular or cylindrical shape
    // - Similar size (4 wheels)
    // - Located at corners of the bounding box
    
    // Simplified: Look for vertices forming circles at Y=0 (ground level)
    const groundVertices = []
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1]
      if (Math.abs(y) < 1.0) { // Near ground
        groundVertices.push(i / 3)
      }
    }
    
    // Group ground vertices by proximity to find potential wheels
    // This is a simplified approach - real implementation would use
    // more sophisticated circle detection
    
    return wheels
  }

  private detectPanels(
    positions: Float32Array | number[], 
    indices: Uint16Array | Uint32Array | number[]
  ): Array<{vertices: number[], indices: number[]}> {
    const panels: Array<{vertices: number[], indices: number[]}> = []
    
    // Detect relatively flat surfaces that could be doors, hood, etc.
    // Calculate surface normals and group faces with similar normals
    
    return panels
  }

  private extractRemainingGeometry(
    positions: Float32Array | number[], 
    indices: Uint16Array | Uint32Array | number[],
    usedComponents: Array<{vertices: number[], indices: number[]}>
  ): {vertices: number[], indices: number[]} {
    // Return geometry not used in other components
    return { vertices: [], indices: [] }
  }

  /**
   * Create a Babylon mesh from component data
   */
  private createMeshFromComponent(
    component: {vertices: number[], indices: number[]}, 
    index: number
  ): BABYLON.Mesh {
    const mesh = new BABYLON.Mesh(`part_${index}`, this.scene)
    
    const vertexData = new BABYLON.VertexData()
    vertexData.positions = component.vertices
    vertexData.indices = component.indices
    
    // Calculate normals
    BABYLON.VertexData.ComputeNormals(
      component.vertices,
      component.indices,
      vertexData.normals = []
    )
    
    vertexData.applyToMesh(mesh)
    
    // Copy material from original
    if (this.originalMesh.material) {
      mesh.material = this.originalMesh.material
    }
    
    return mesh
  }

  /**
   * Classify what type of car part this mesh represents
   */
  private classifyCarPart(mesh: BABYLON.Mesh): CarPart['type'] {
    const bounds = mesh.getBoundingInfo().boundingBox
    const size = bounds.maximum.subtract(bounds.minimum)
    const aspectRatio = size.x / size.z
    const verticalRatio = size.y / Math.max(size.x, size.z)
    
    // Wheel detection (roughly circular, similar sizes)
    if (aspectRatio > 0.8 && aspectRatio < 1.2 && verticalRatio > 0.8) {
      return 'wheel'
    }
    
    // Spoiler detection (thin, horizontal, at the top/back)
    if (verticalRatio < 0.2 && bounds.center.y > 0) {
      return 'spoiler'
    }
    
    // Mirror detection (small, on sides)
    const volume = size.x * size.y * size.z
    if (volume < 0.1 && Math.abs(bounds.center.x) > 1) {
      return 'mirror'
    }
    
    // Window detection (thin, vertical or angled)
    if (size.y > size.x && verticalRatio > 1) {
      return 'window'
    }
    
    // Door detection (flat, on sides)
    if (verticalRatio < 0.3 && Math.abs(bounds.center.x) > 0.5) {
      return 'door'
    }
    
    // Default to body for larger parts
    return 'body'
  }

  /**
   * Identify and group wheels (usually 4 similar meshes)
   */
  private identifyWheels(parts: CarPart[]) {
    const potentialWheels = parts.filter(p => 
      p.type === 'wheel' || p.type === 'other'
    ).sort((a, b) => a.vertices - b.vertices)
    
    // Look for 4 similar-sized parts
    if (potentialWheels.length >= 4) {
      const wheelSize = potentialWheels[0].vertices
      let wheelCount = 0
      
      for (const part of potentialWheels) {
        if (Math.abs(part.vertices - wheelSize) / wheelSize < 0.2) {
          part.type = 'wheel'
          part.name = `wheel_${wheelCount++}`
          if (wheelCount >= 4) break
        }
      }
    }
  }

  /**
   * Identify body panels and doors
   */
  private identifyBodyPanels(parts: CarPart[]) {
    // Look for symmetric parts on left/right sides
    const sideParts = parts.filter(p => 
      Math.abs(p.bounds.center.x) > 0.3
    )
    
    sideParts.forEach(part => {
      // Check if there's a matching part on the opposite side
      const opposite = sideParts.find(other => 
        other !== part &&
        Math.abs(part.bounds.center.x + other.bounds.center.x) < 0.1 &&
        Math.abs(part.vertices - other.vertices) / part.vertices < 0.1
      )
      
      if (opposite && part.type === 'other') {
        part.type = 'door'
        part.name = part.bounds.center.x > 0 ? 'door_right' : 'door_left'
      }
    })
  }

  /**
   * Export segmented mesh to different formats
   */
  async exportToFormat(format: 'gltf' | 'glb' | 'obj' | 'stl'): Promise<Blob> {
    switch (format) {
      case 'gltf':
      case 'glb':
        return this.exportToGLTF(format === 'glb')
      case 'obj':
        return this.exportToOBJ()
      case 'stl':
        return this.exportToSTL()
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  private async exportToGLTF(binary: boolean): Promise<Blob> {
    // Use Babylon's GLTF exporter
    const options = {
      shouldExportNode: (node: BABYLON.Node) => {
        return this.parts.has(node.name) || node === this.originalMesh
      }
    }
    
    // This would use BABYLON.GLTF2Export
    // Implementation depends on babylon serializers package
    return new Blob([''], { type: binary ? 'model/gltf-binary' : 'model/gltf+json' })
  }

  private exportToOBJ(): Blob {
    let objContent = '# Atelier Segmented Mesh\n'
    objContent += '# Exported with separate parts\n\n'
    
    let vertexOffset = 1
    
    this.parts.forEach(part => {
      objContent += `# Part: ${part.name} (${part.type})\n`
      objContent += `g ${part.name}\n`
      
      const positions = part.mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)
      const indices = part.mesh.getIndices()
      
      if (positions && indices) {
        // Write vertices
        for (let i = 0; i < positions.length; i += 3) {
          objContent += `v ${positions[i]} ${positions[i + 1]} ${positions[i + 2]}\n`
        }
        
        // Write faces
        for (let i = 0; i < indices.length; i += 3) {
          objContent += `f ${indices[i] + vertexOffset} ${indices[i + 1] + vertexOffset} ${indices[i + 2] + vertexOffset}\n`
        }
        
        vertexOffset += positions.length / 3
      }
      
      objContent += '\n'
    })
    
    return new Blob([objContent], { type: 'model/obj' })
  }

  private exportToSTL(): Blob {
    // Combine all parts back into single STL if needed
    // Or export as multiple STL files
    return new Blob([''], { type: 'model/stl' })
  }

  /**
   * Get all segmented parts
   */
  getParts(): CarPart[] {
    return Array.from(this.parts.values())
  }

  /**
   * Get specific part by name or type
   */
  getPart(nameOrType: string): CarPart | undefined {
    return this.parts.get(nameOrType) || 
           Array.from(this.parts.values()).find(p => p.type === nameOrType)
  }

  /**
   * Merge parts back together
   */
  mergeParts(partNames: string[]): BABYLON.Mesh {
    const meshes = partNames
      .map(name => this.parts.get(name)?.mesh)
      .filter(mesh => mesh !== undefined) as BABYLON.Mesh[]
    
    if (meshes.length === 0) return this.originalMesh
    
    const merged = BABYLON.Mesh.MergeMeshes(
      meshes,
      true, // dispose source
      true, // allow different materials
      undefined,
      false,
      true
    )
    
    return merged || this.originalMesh
  }
}
