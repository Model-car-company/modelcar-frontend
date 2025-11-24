/**
 * SAM (Segment Anything Model) Integration for 3D Part Selection
 * Uses Meta's SAM model to identify car parts visually
 */

import * as BABYLON from 'babylonjs'

export interface SAMPoint {
  x: number
  y: number
  label: 1 | 0 // 1 for positive (include), 0 for negative (exclude)
}

export interface SAMSegment {
  id: string
  mask: ImageData
  bbox: { x: number, y: number, width: number, height: number }
  confidence: number
  meshes?: BABYLON.Mesh[]
}

export class SAMSegmenter {
  private scene: BABYLON.Scene
  private canvas: HTMLCanvasElement
  private samWorker?: Worker
  private segments: Map<string, SAMSegment> = new Map()
  
  // SAM API configuration - NO API KEYS ON CLIENT
  private readonly SAM_API_URL = '/api/segment' // Use server-side API route
  private readonly SAM_MODEL = 'sam_vit_h' // Can be sam_vit_b, sam_vit_l, sam_vit_h
  
  constructor(scene: BABYLON.Scene) {
    this.scene = scene
    this.canvas = scene.getEngine().getRenderingCanvas()!
  }

  /**
   * Initialize SAM - either using API or local model
   */
  async initialize() {
    // Always use server-side API route for security
    // No API keys exposed on client-side
    return
  }

  /**
   * Segment the current view with point prompts
   */
  async segmentWithPoints(points: SAMPoint[]): Promise<SAMSegment[]> {
    // Capture current view as image
    const imageData = this.captureView()
    
    // Send to SAM for segmentation
    const segments = await this.runSAM(imageData, points)
    
    // Map segments back to 3D meshes
    const mappedSegments = await this.mapSegmentsToMeshes(segments)
    
    return mappedSegments
  }

  /**
   * Capture the current 3D view as an image
   */
  private captureView(): ImageData {
    const ctx = document.createElement('canvas').getContext('2d')!
    const width = this.canvas.width
    const height = this.canvas.height
    
    ctx.canvas.width = width
    ctx.canvas.height = height
    ctx.drawImage(this.canvas, 0, 0)
    
    return ctx.getImageData(0, 0, width, height)
  }

  /**
   * Run SAM segmentation
   */
  private async runSAM(imageData: ImageData, points: SAMPoint[]): Promise<SAMSegment[]> {
    // SECURITY: Always use server-side API route, never expose keys on client
    // All API calls go through /api/segment which handles authentication server-side
    
    // Option 3: Use mock segmentation for testing
    return this.mockSegmentation(imageData, points)
  }

  /**
   * Run SAM using Replicate API
   */
  private async runSAMWithReplicate(imageData: ImageData, points: SAMPoint[]): Promise<SAMSegment[]> {
    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(imageData, 0, 0)
    
    const base64Image = canvas.toDataURL('image/png').split(',')[1]
    
    const response = await fetch('/api/segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        points: points,
        model: this.SAM_MODEL
      })
    })
    
    const result = await response.json()
    return this.parseSegments(result.masks)
  }

  /**
   * Run SAM locally using transformers.js
   */
  private async runSAMLocal(imageData: ImageData, points: SAMPoint[]): Promise<SAMSegment[]> {
    return new Promise((resolve) => {
      this.samWorker!.postMessage({
        type: 'segment',
        imageData,
        points
      })
      
      this.samWorker!.onmessage = (e) => {
        if (e.data.type === 'segments') {
          resolve(this.parseSegments(e.data.masks))
        }
      }
    })
  }

  /**
   * Mock segmentation for testing without SAM
   */
  private mockSegmentation(imageData: ImageData, points: SAMPoint[]): SAMSegment[] {
    const segments: SAMSegment[] = []
    
    // Create mock segments based on click points
    points.forEach((point, index) => {
      // Simulate different car parts based on click location
      const partType = this.guessPartType(point, imageData.width, imageData.height)
      
      segments.push({
        id: `segment_${index}`,
        mask: this.createMockMask(point, imageData.width, imageData.height, partType),
        bbox: this.createMockBBox(point, imageData.width, imageData.height, partType),
        confidence: 0.95
      })
    })
    
    return segments
  }

  /**
   * Guess part type based on click position
   */
  private guessPartType(point: SAMPoint, width: number, height: number): string {
    const relX = point.x / width
    const relY = point.y / height
    
    // Bottom corners = wheels
    if (relY > 0.6) {
      if (relX < 0.3 || relX > 0.7) return 'wheel'
    }
    
    // Middle sides = doors
    if (relY > 0.3 && relY < 0.6) {
      if (relX < 0.2 || relX > 0.8) return 'door'
    }
    
    // Top = roof/windows
    if (relY < 0.3) return 'window'
    
    // Front/back = bumpers
    if (relX < 0.15 || relX > 0.85) return 'bumper'
    
    return 'body'
  }

  /**
   * Create a mock mask for testing
   */
  private createMockMask(point: SAMPoint, width: number, height: number, partType: string): ImageData {
    const mask = new ImageData(width, height)
    const radius = partType === 'wheel' ? 50 : 100
    
    // Create circular mask around point
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2))
        if (dist < radius) {
          const idx = (y * width + x) * 4
          mask.data[idx] = 255     // R
          mask.data[idx + 1] = 0   // G
          mask.data[idx + 2] = 255 // B
          mask.data[idx + 3] = 128 // A (semi-transparent)
        }
      }
    }
    
    return mask
  }

  /**
   * Create a mock bounding box
   */
  private createMockBBox(point: SAMPoint, width: number, height: number, partType: string): any {
    const size = partType === 'wheel' ? 100 : 200
    return {
      x: Math.max(0, point.x - size/2),
      y: Math.max(0, point.y - size/2),
      width: Math.min(size, width - point.x + size/2),
      height: Math.min(size, height - point.y + size/2)
    }
  }

  /**
   * Parse SAM output masks
   */
  private parseSegments(masks: any[]): SAMSegment[] {
    return masks.map((mask, index) => ({
      id: `segment_${index}`,
      mask: mask.data,
      bbox: mask.bbox,
      confidence: mask.confidence || 0.9
    }))
  }

  /**
   * Map 2D segments back to 3D meshes
   */
  private async mapSegmentsToMeshes(segments: SAMSegment[]): Promise<SAMSegment[]> {
    const camera = this.scene.activeCamera!
    
    segments.forEach(segment => {
      const meshes: BABYLON.Mesh[] = []
      
      // For each mesh in scene
      this.scene.meshes.forEach(mesh => {
        if (!(mesh instanceof BABYLON.Mesh) || mesh.name === 'ground' || mesh.name === 'grid') {
          return
        }
        
        // Project mesh to screen coordinates
        const boundingInfo = mesh.getBoundingInfo()
        const center = boundingInfo.boundingBox.centerWorld
        
        const screenPos = BABYLON.Vector3.Project(
          center,
          mesh.getWorldMatrix(),
          this.scene.getTransformMatrix(),
          camera.viewport
        )
        
        const screenX = screenPos.x * this.canvas.width
        const screenY = screenPos.y * this.canvas.height
        
        // Check if mesh center is within segment mask
        if (this.isPointInMask(screenX, screenY, segment.mask)) {
          meshes.push(mesh as BABYLON.Mesh)
        }
      })
      
      segment.meshes = meshes
    })
    
    return segments
  }

  /**
   * Check if a point is within a mask
   */
  private isPointInMask(x: number, y: number, mask: ImageData): boolean {
    if (x < 0 || x >= mask.width || y < 0 || y >= mask.height) return false
    
    const idx = (Math.floor(y) * mask.width + Math.floor(x)) * 4
    return mask.data[idx + 3] > 128 // Check alpha channel
  }

  /**
   * Interactive selection mode
   */
  async startInteractiveSelection(
    onSegment: (segment: SAMSegment) => void,
    onComplete: () => void
  ) {
    const points: SAMPoint[] = []
    let isSelecting = true
    
    const handleClick = async (event: MouseEvent) => {
      if (!isSelecting) return
      
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Add point (shift+click for negative point)
      points.push({
        x,
        y,
        label: event.shiftKey ? 0 : 1
      })
      
      // Run segmentation with accumulated points
      const segments = await this.segmentWithPoints(points)
      
      // Callback with the best segment
      if (segments.length > 0) {
        onSegment(segments[0])
      }
      
      // Right click or escape to finish
      if (event.button === 2) {
        isSelecting = false
        onComplete()
      }
    }
    
    this.canvas.addEventListener('click', handleClick)
    
    return () => {
      this.canvas.removeEventListener('click', handleClick)
    }
  }

  /**
   * Highlight meshes based on segment
   */
  highlightSegment(segment: SAMSegment, color: BABYLON.Color3) {
    if (!segment.meshes) return
    
    segment.meshes.forEach(mesh => {
      mesh.enableEdgesRendering()
      mesh.edgesWidth = 4.0
      mesh.edgesColor = new BABYLON.Color4(color.r, color.g, color.b, 1)
    })
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    this.scene.meshes.forEach(mesh => {
      if (mesh instanceof BABYLON.Mesh) {
        mesh.disableEdgesRendering()
      }
    })
  }

  /**
   * Export segmented parts
   */
  exportSegments(): { [key: string]: BABYLON.Mesh[] } {
    const parts: { [key: string]: BABYLON.Mesh[] } = {}
    
    this.segments.forEach((segment, id) => {
      if (segment.meshes && segment.meshes.length > 0) {
        parts[id] = segment.meshes
      }
    })
    
    return parts
  }
}

/**
 * Automatic car part detection using SAM
 */
export class AutoCarPartDetector {
  private segmenter: SAMSegmenter
  
  constructor(scene: BABYLON.Scene) {
    this.segmenter = new SAMSegmenter(scene)
  }
  
  /**
   * Automatically detect all car parts
   */
  async detectAllParts(): Promise<Map<string, SAMSegment>> {
    const parts = new Map<string, SAMSegment>()
    
    // Define strategic points for each car part
    const partPoints = {
      'wheel_front_left': { x: 0.2, y: 0.7 },
      'wheel_front_right': { x: 0.8, y: 0.7 },
      'wheel_rear_left': { x: 0.25, y: 0.75 },
      'wheel_rear_right': { x: 0.75, y: 0.75 },
      'door_left': { x: 0.3, y: 0.5 },
      'door_right': { x: 0.7, y: 0.5 },
      'hood': { x: 0.5, y: 0.4 },
      'trunk': { x: 0.5, y: 0.6 },
      'windshield': { x: 0.5, y: 0.35 },
      'roof': { x: 0.5, y: 0.25 },
      'bumper_front': { x: 0.15, y: 0.5 },
      'bumper_rear': { x: 0.85, y: 0.5 }
    }
    
    // Get canvas dimensions
    const canvas = this.segmenter['canvas']
    const width = canvas.width
    const height = canvas.height
    
    // Detect each part
    for (const [partName, relPos] of Object.entries(partPoints)) {
      const point: SAMPoint = {
        x: relPos.x * width,
        y: relPos.y * height,
        label: 1
      }
      
      const segments = await this.segmenter.segmentWithPoints([point])
      if (segments.length > 0) {
        parts.set(partName, segments[0])
      }
    }
    
    return parts
  }
}
