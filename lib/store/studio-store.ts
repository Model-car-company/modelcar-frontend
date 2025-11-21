import { create } from 'zustand'
import { CarAssembly, CarPart, PartCategory, StudioState, ExportOptions } from '../types/car-parts'

interface StudioStore extends StudioState {
  // Actions
  setSelectedCategory: (category: PartCategory | null) => void
  setSelectedPart: (part: CarPart | null) => void
  setViewMode: (mode: StudioState['viewMode']) => void
  toggleGrid: () => void
  toggleMountPoints: () => void
  toggleAnimation: () => void
  
  // Part management
  addPartToAssembly: (category: PartCategory, part: CarPart) => void
  removePartFromAssembly: (category: PartCategory) => void
  updatePartTransform: (partId: string, transform: any) => void
  
  // Assembly management
  loadAssembly: (assembly: CarAssembly) => void
  saveAssembly: () => Promise<void>
  resetAssembly: () => void
  exportAssembly: (options: ExportOptions) => Promise<void>
  
  // Undo/Redo
  history: CarAssembly[]
  historyIndex: number
  undo: () => void
  redo: () => void
}

const defaultAssembly: CarAssembly = {
  id: '',
  name: 'New Build',
  parts: {},
  public: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  // Initial state
  currentAssembly: defaultAssembly,
  selectedCategory: null,
  selectedPart: null,
  viewMode: 'assembled',
  showGrid: true,
  showMountPoints: false,
  animationPlaying: false,
  history: [defaultAssembly],
  historyIndex: 0,
  
  // Actions
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  setSelectedPart: (part) => set({ selectedPart: part }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  toggleMountPoints: () => set((state) => ({ showMountPoints: !state.showMountPoints })),
  
  toggleAnimation: () => set((state) => ({ animationPlaying: !state.animationPlaying })),
  
  // Part management
  addPartToAssembly: (category, part) => set((state) => {
    const newAssembly = {
      ...state.currentAssembly,
      parts: {
        ...state.currentAssembly.parts,
        [category]: part,
      },
      updatedAt: new Date().toISOString(),
    }
    
    // Add to history
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push(newAssembly)
    
    return {
      currentAssembly: newAssembly,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    }
  }),
  
  removePartFromAssembly: (category) => set((state) => {
    const { [category]: removed, ...remainingParts } = state.currentAssembly.parts
    
    const newAssembly = {
      ...state.currentAssembly,
      parts: remainingParts,
      updatedAt: new Date().toISOString(),
    }
    
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push(newAssembly)
    
    return {
      currentAssembly: newAssembly,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    }
  }),
  
  updatePartTransform: (partId, transform) => set((state) => {
    const existingMods = state.currentAssembly.modifications || []
    const modIndex = existingMods.findIndex(m => m.partId === partId)
    
    let newMods
    if (modIndex >= 0) {
      newMods = [...existingMods]
      newMods[modIndex] = { ...newMods[modIndex], ...transform }
    } else {
      newMods = [...existingMods, { partId, ...transform }]
    }
    
    return {
      currentAssembly: {
        ...state.currentAssembly,
        modifications: newMods,
        updatedAt: new Date().toISOString(),
      }
    }
  }),
  
  // Assembly management
  loadAssembly: (assembly) => set({
    currentAssembly: assembly,
    history: [assembly],
    historyIndex: 0,
  }),
  
  saveAssembly: async () => {
    const assembly = get().currentAssembly
    
    try {
      const response = await fetch('/api/assemblies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assembly),
      })
      
      if (!response.ok) throw new Error('Failed to save assembly')
      
      const saved = await response.json()
      set({ currentAssembly: saved })
      
    } catch (error) {
      console.error('Save error:', error)
      throw error
    }
  },
  
  resetAssembly: () => set({
    currentAssembly: defaultAssembly,
    selectedCategory: null,
    selectedPart: null,
    history: [defaultAssembly],
    historyIndex: 0,
  }),
  
  exportAssembly: async (options) => {
    const assembly = get().currentAssembly
    
    try {
      const response = await fetch('/api/export-assembly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assembly, options }),
      })
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${assembly.name}.${options.format}`
      a.click()
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Export error:', error)
      throw error
    }
  },
  
  // Undo/Redo
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1
      return {
        currentAssembly: state.history[newIndex],
        historyIndex: newIndex,
      }
    }
    return state
  }),
  
  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1
      return {
        currentAssembly: state.history[newIndex],
        historyIndex: newIndex,
      }
    }
    return state
  }),
}))
