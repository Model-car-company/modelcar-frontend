// Core type definitions for modular car building system

export type PartCategory = 
  | 'body'
  | 'wheels'
  | 'interior'
  | 'engine'
  | 'frame'
  | 'accessories'
  | 'lights'
  | 'spoiler'
  | 'exhaust'

export type ArticulationType = 'hinge' | 'slider' | 'ball-joint' | 'fixed'

export interface MountPoint {
  id: string
  position: [number, number, number]  // x, y, z
  normal: [number, number, number]    // surface normal
  type: string  // 'wheel-hub', 'engine-mount', etc.
  diameter?: number
  constraints?: {
    minSize?: number
    maxSize?: number
    compatibleParts?: string[]
  }
}

export interface ArticulationData {
  type: ArticulationType
  axis: [number, number, number]
  limits?: [number, number]  // min, max rotation/translation
  pivotPoint?: [number, number, number]
  linkedParts?: string[]
}

export interface CarPart {
  id: string
  name: string
  category: PartCategory
  meshUrl: string
  thumbnailUrl: string
  description?: string
  
  // Mounting & assembly
  mountingPoints: MountPoint[]
  mountsTo?: PartCategory[]  // What categories this can attach to
  
  // Physical properties
  dimensions: {
    width: number
    height: number
    depth: number
  }
  scale: number
  
  // Movement & animation
  articulation?: ArticulationData
  movingParts?: {
    name: string
    meshPath: string
    articulation: ArticulationData
  }[]
  
  // Printing info
  printable: boolean
  supportRequired?: boolean
  printTime?: number  // minutes
  filamentWeight?: number  // grams
  
  // Marketplace
  price?: number
  author?: string
  downloads?: number
  rating?: number
  tags?: string[]
  
  // Compatibility
  compatibleWith?: string[]  // Part IDs
  incompatibleWith?: string[]
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface CarAssembly {
  id: string
  name: string
  description?: string
  thumbnailUrl?: string
  
  // Selected parts
  parts: {
    [category in PartCategory]?: CarPart
  }
  
  // Custom modifications
  modifications?: {
    partId: string
    scale?: [number, number, number]
    rotation?: [number, number, number]
    position?: [number, number, number]
    color?: string
    materialOverride?: any
  }[]
  
  // Assembly metadata
  totalPrintTime?: number
  totalFilament?: number
  totalCost?: number
  complexity?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  
  // Sharing
  public: boolean
  author?: string
  createdAt: string
  updatedAt: string
}

export interface PartLibrary {
  categories: {
    [K in PartCategory]: {
      name: string
      description: string
      icon: string
      parts: CarPart[]
    }
  }
}

// UI State
export interface StudioState {
  currentAssembly: CarAssembly
  selectedCategory: PartCategory | null
  selectedPart: CarPart | null
  viewMode: 'assembled' | 'exploded' | 'wireframe' | 'xray'
  showGrid: boolean
  showMountPoints: boolean
  animationPlaying: boolean
}

// Export formats
export interface ExportOptions {
  format: 'stl' | 'obj' | 'glb' | 'step' | '3mf'
  separateParts: boolean
  includeSupports: boolean
  scale: number
  units: 'mm' | 'cm' | 'inches'
  quality: 'draft' | 'standard' | 'high' | 'ultra'
}
