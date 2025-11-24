'use client'

import { useEffect, useRef, useState } from 'react'
import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
import { MeshSegmenter, type CarPart } from '../lib/mesh-segmentation'
import { SAMSegmenter, type SAMPoint, type SAMSegment } from '../lib/sam-integration'

interface Studio3DViewerBabylonProps {
  showGrid?: boolean
  viewMode?: 'solid' | 'wireframe' | 'normal' | 'uv'
  material?: {
    metalness: number
    roughness: number
    color: string
    wireframe: boolean
  }
  modelUrl?: string
  onGeometryUpdate?: (geometry: any) => void
  geometry?: any
}

export default function Studio3DViewerBabylon({
  showGrid = true,
  viewMode = 'solid',
  material,
  modelUrl = '/models/gta-pegassi-zentorno.stl',
  onGeometryUpdate,
  geometry,
  isEditMode = false,
  selectedTool = 'select',
}: Studio3DViewerBabylonProps & { isEditMode?: boolean; selectedTool?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<BABYLON.Scene | null>(null)
  const engineRef = useRef<BABYLON.Engine | null>(null)
  const meshRef = useRef<BABYLON.Mesh | null>(null)
  const [selectedFaces, setSelectedFaces] = useState<Set<number>>(new Set())
  const [selectedParts, setSelectedParts] = useState<Set<BABYLON.Mesh>>(new Set())
  const [isDrawingSelection, setIsDrawingSelection] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{start: {x: number, y: number}, end: {x: number, y: number}} | null>(null)
  const [cameraAlpha, setCameraAlpha] = useState(Math.PI / 2)
  const [cameraBeta, setCameraBeta] = useState(Math.PI / 3)
  const axisCanvasRef = useRef<HTMLCanvasElement>(null)
  const axisSceneRef = useRef<BABYLON.Scene | null>(null)
  const highlightLayerRef = useRef<BABYLON.HighlightLayer | null>(null)
  const segmenterRef = useRef<MeshSegmenter | null>(null)
  const samSegmenterRef = useRef<SAMSegmenter | null>(null)
  const [carParts, setCarParts] = useState<CarPart[]>([])
  const [isSegmented, setIsSegmented] = useState(false)
  const [samPoints, setSamPoints] = useState<SAMPoint[]>([])
  const [samSegments, setSamSegments] = useState<SAMSegment[]>([])
  const [isSAMMode, setIsSAMMode] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Babylon.js engine
    const engine = new BABYLON.Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })
    engineRef.current = engine

    const scene = new BABYLON.Scene(engine)
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1) // Black background
    sceneRef.current = scene

    // Camera - matches Three.js setup
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 3,
      15,
      BABYLON.Vector3.Zero(),
      scene
    )
    camera.attachControl(canvasRef.current, true)
    camera.wheelPrecision = 20 // Faster zoom (lower = faster)
    camera.lowerRadiusLimit = 3
    camera.upperRadiusLimit = 50
    camera.panningSensibility = 250 // Slower panning (higher = slower)
    
    // Store camera reference for later control
    const cameraRef = camera
    
    // Track camera movement for axis indicator
    scene.registerBeforeRender(() => {
      setCameraAlpha(camera.alpha)
      setCameraBeta(camera.beta)
    })

    // Lighting setup - Studio lighting for premium car look
    const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene)
    light1.intensity = 0.7
    light1.groundColor = new BABYLON.Color3(0.1, 0.1, 0.12) // Dark ground for contrast
    
    // Key light - main directional light
    const keyLight = new BABYLON.DirectionalLight('keyLight', new BABYLON.Vector3(-1, -2, -1), scene)
    keyLight.intensity = 0.8
    keyLight.position = new BABYLON.Vector3(10, 10, 5)
    
    // Fill light - softer from opposite side
    const fillLight = new BABYLON.DirectionalLight('fillLight', new BABYLON.Vector3(1, -1, 0.5), scene)
    fillLight.intensity = 0.3
    fillLight.position = new BABYLON.Vector3(-5, 8, -5)
    
    // Rim light - highlights edges
    const rimLight = new BABYLON.DirectionalLight('rimLight', new BABYLON.Vector3(0, 1, -1), scene)
    rimLight.intensity = 0.4
    rimLight.position = new BABYLON.Vector3(0, 5, 10)
    
    // Add subtle ambient for visibility
    scene.ambientColor = new BABYLON.Color3(0.15, 0.15, 0.18)
    
    // Create environment texture for reflections ONLY (no skybox)
    const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
      "https://assets.babylonjs.com/environments/environmentSpecular.env",
      scene
    )
    scene.environmentTexture = envTexture
    // NO SKYBOX - keeping dark background
    
    // Create highlight layer for selected parts
    const highlightLayer = new BABYLON.HighlightLayer('highlightLayer', scene)
    highlightLayer.innerGlow = false
    highlightLayer.outerGlow = true
    highlightLayerRef.current = highlightLayer

    // Grid floor - using lines for clean squares
    if (showGrid) {
      // Create grid using line system for clean squares
      const gridSize = 50
      const gridStep = 2
      const gridLines = []
      
      // Create horizontal lines
      for (let i = -gridSize / 2; i <= gridSize / 2; i += gridStep) {
        gridLines.push([
          new BABYLON.Vector3(-gridSize / 2, 0, i),
          new BABYLON.Vector3(gridSize / 2, 0, i)
        ])
      }
      
      // Create vertical lines
      for (let i = -gridSize / 2; i <= gridSize / 2; i += gridStep) {
        gridLines.push([
          new BABYLON.Vector3(i, 0, -gridSize / 2),
          new BABYLON.Vector3(i, 0, gridSize / 2)
        ])
      }
      
      // Create the line system
      const gridLineSystem = BABYLON.MeshBuilder.CreateLineSystem('grid', {
        lines: gridLines,
      }, scene)
      gridLineSystem.color = new BABYLON.Color3(0.25, 0.25, 0.25)
      gridLineSystem.position.y = -0.01
    }

    // Load model
    if (modelUrl) {
      const extension = modelUrl.split('.').pop()?.toLowerCase()
      
      BABYLON.SceneLoader.LoadAssetContainer(
        modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1),
        modelUrl.substring(modelUrl.lastIndexOf('/') + 1),
        scene,
        (container) => {
          container.addAllToScene()
          const loadedMesh = container.meshes[0] as BABYLON.Mesh
          
          // Auto-scale based on bounding box
          const bounds = loadedMesh.getBoundingInfo()
          const size = bounds.boundingBox.maximum.subtract(bounds.boundingBox.minimum)
          const maxDim = Math.max(size.x, size.y, size.z)
          const targetSize = 10
          const scale = targetSize / maxDim
          loadedMesh.scaling = new BABYLON.Vector3(scale, scale, scale)
          
          // Center the model on the grid
          const center = bounds.boundingBox.center.scale(scale)
          loadedMesh.position = new BABYLON.Vector3(-center.x, -center.y + 1, -center.z)
          
          // Create appropriate material based on view mode
          let mat: BABYLON.Material
          
          if (viewMode === 'wireframe' || material?.wireframe) {
            // Wireframe mode - use simple material
            const wireMat = new BABYLON.StandardMaterial('wireframeMat', scene)
            wireMat.wireframe = true
            wireMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5)
            wireMat.backFaceCulling = false
            mat = wireMat
          } else {
            // Create premium metallic car paint material
            const pbrMat = new BABYLON.PBRMaterial('carMaterial', scene)
            
            // Premium metallic car paint
            pbrMat.albedoColor = new BABYLON.Color3(0.55, 0.57, 0.58) // Gunmetal gray base
            pbrMat.metallic = material?.metalness ?? 0.9 // Very metallic
            pbrMat.roughness = material?.roughness ?? 0.15 // Smooth, polished surface
            pbrMat.reflectivityColor = new BABYLON.Color3(0.9, 0.9, 0.92) // Bright reflections
            
            // Add subtle blue tint to reflections (premium car effect)
            pbrMat.reflectionColor = new BABYLON.Color3(0.95, 0.95, 1.0)
            pbrMat.microSurface = 0.96 // Very smooth micro surface
            
            // Clear coat effect
            pbrMat.clearCoat.isEnabled = true
            pbrMat.clearCoat.intensity = 0.5
            pbrMat.clearCoat.roughness = 0.01
            
            // Enable environment reflections for realistic look
            pbrMat.environmentIntensity = 0.7
            pbrMat.backFaceCulling = false // Enable double-sided rendering
            pbrMat.twoSidedLighting = true // Light both sides
            
            mat = pbrMat
          }
          
          // Apply material and setup parts for selection
          loadedMesh.material = mat
          const selectableParts: BABYLON.Mesh[] = []
          
          container.meshes.forEach(mesh => {
            mesh.material = mat
            mesh.isPickable = true
            // Ensure all parts are visible
            if (mesh instanceof BABYLON.Mesh) {
              mesh.sideOrientation = BABYLON.Mesh.DOUBLESIDE
              selectableParts.push(mesh)
            }
          })
          
          loadedMesh.isPickable = true
          meshRef.current = loadedMesh
          
          // Initialize mesh segmenter
          segmenterRef.current = new MeshSegmenter(scene, loadedMesh)
          
          // Initialize SAM segmenter
          samSegmenterRef.current = new SAMSegmenter(scene)
          samSegmenterRef.current.initialize()
          
          // Enhanced selection system with individual parts and draw selection
          let isDrawing = false
          let drawStart: {x: number, y: number} | null = null
          
          scene.onPointerObservable.add((pointerInfo) => {
            const canvas = scene.getEngine().getRenderingCanvas()
            if (!canvas) return
            
            // Get the camera
            const camera = scene.activeCamera as BABYLON.ArcRotateCamera
            
            switch (pointerInfo.type) {
              case BABYLON.PointerEventTypes.POINTERDOWN:
                // Handle SAM mode clicks
                if (selectedTool === 'sam' && samSegmenterRef.current) {
                  const rect = canvas.getBoundingClientRect()
                  const x = pointerInfo.event.clientX - rect.left
                  const y = pointerInfo.event.clientY - rect.top
                  
                  // Add SAM point (shift+click for negative/exclude point)
                  const newPoint: SAMPoint = {
                    x,
                    y,
                    label: pointerInfo.event.shiftKey ? 0 : 1
                  }
                  
                  // Use functional update to ensure we have the latest points
                  setSamPoints(prev => {
                    const updatedPoints = [...prev, newPoint]
                    
                    // Run SAM segmentation with updated points
                    samSegmenterRef.current!.segmentWithPoints(updatedPoints).then(segments => {
                      setSamSegments(segments)
                      
                      // Highlight the segmented meshes
                      if (segments.length > 0 && highlightLayerRef.current) {
                        // Clear previous highlights
                        selectedParts.forEach(mesh => {
                          highlightLayerRef.current!.removeMesh(mesh)
                        })
                        
                        // Highlight new segments
                        const newSelection = new Set<BABYLON.Mesh>()
                        segments.forEach(segment => {
                          if (segment.meshes) {
                            segment.meshes.forEach(mesh => {
                              highlightLayerRef.current!.addMesh(mesh, BABYLON.Color3.FromHexString('#4A90E2'))
                              newSelection.add(mesh)
                            })
                          }
                        })
                        setSelectedParts(newSelection)
                      }
                    })
                    
                    return updatedPoints
                  })
                  
                  // Prevent camera movement
                  camera.detachControl()
                  pointerInfo.event.preventDefault()
                } else {
                  // Check if clicking on a mesh (not ground/grid)
                  const pickResult = scene.pick(scene.pointerX, scene.pointerY)
                  if (pickResult && pickResult.hit && pickResult.pickedMesh && 
                      pickResult.pickedMesh.name !== 'ground' && 
                      pickResult.pickedMesh.name !== 'grid' &&
                      !pointerInfo.event.shiftKey) {
                    // Check if the mesh has a partGroup (indicates we're in parts mode)
                    const meshAny = pickResult.pickedMesh as any
                    if (meshAny.partGroup) {
                      // Disable camera controls when clicking on a part in parts mode
                      camera.detachControl()
                    }
                  }
                }
                
                // Start draw selection with Shift+Click
                if (pointerInfo.event.button === 0 && pointerInfo.event.shiftKey) {
                  isDrawing = true
                  drawStart = {
                    x: pointerInfo.event.clientX,
                    y: pointerInfo.event.clientY
                  }
                  setIsDrawingSelection(true)
                  setSelectionBox({
                    start: drawStart,
                    end: drawStart
                  })
                  pointerInfo.event.preventDefault()
                  // Disable camera for box selection
                  camera.detachControl()
                }
                break
              
              case BABYLON.PointerEventTypes.POINTERMOVE:
                // Change cursor when hovering over selectable parts
                if (!isDrawing) {
                  const hoverResult = scene.pick(scene.pointerX, scene.pointerY)
                  if (hoverResult && hoverResult.hit && hoverResult.pickedMesh) {
                    const meshAny = hoverResult.pickedMesh as any
                    if (meshAny.partGroup && canvas) {
                      canvas.style.cursor = 'pointer'
                    } else if (canvas) {
                      canvas.style.cursor = 'default'
                    }
                  } else if (canvas) {
                    canvas.style.cursor = 'default'
                  }
                }
                // Update selection box while drawing
                if (isDrawing && drawStart) {
                  setSelectionBox({
                    start: drawStart,
                    end: {
                      x: pointerInfo.event.clientX,
                      y: pointerInfo.event.clientY
                    }
                  })
                }
                break
                
              case BABYLON.PointerEventTypes.POINTERUP:
                // Complete draw selection
                if (isDrawing && drawStart) {
                  isDrawing = false
                  setIsDrawingSelection(false)
                  
                  // Select all parts within the drawn box
                  const endPoint = {
                    x: pointerInfo.event.clientX,
                    y: pointerInfo.event.clientY
                  }
                  
                  selectPartsInBox(scene, selectableParts, drawStart, endPoint, canvas)
                  setSelectionBox(null)
                  drawStart = null
                  
                  // Re-enable camera after selection
                  camera.attachControl(canvas, true)
                }
                
                // Always re-enable camera after mouse up
                // Small delay to allow selection to process first
                setTimeout(() => {
                  camera.attachControl(canvas, true)
                }, 100)
                break
                
              case BABYLON.PointerEventTypes.POINTERPICK:
                // Click selection for individual parts
                if (!pointerInfo.event.shiftKey && !isDrawing) {
                  const pickedMesh = pointerInfo.pickInfo?.pickedMesh as BABYLON.Mesh
                  if (pickedMesh && pickedMesh.name !== 'ground' && pickedMesh.name !== 'grid') {
                    if (pointerInfo.event.ctrlKey || pointerInfo.event.metaKey) {
                      // Multi-select with Ctrl/Cmd
                      togglePartSelection(pickedMesh)
                    } else {
                      // Single selection
                      clearAllSelections()
                      selectSinglePart(pickedMesh)
                    }
                  } else if (!pointerInfo.event.ctrlKey && !pointerInfo.event.metaKey) {
                    // Click empty space to clear
                    clearAllSelections()
                  }
                }
                break
            }
          })
          
          // Selection helper functions
          const selectSinglePart = (mesh: BABYLON.Mesh) => {
            // If in parts mode, select the entire part group
            if ((mesh as any).partGroup) {
              const partGroup = (mesh as any).partGroup
              const allMeshes = (partGroup as any).allMeshes || [partGroup.mesh]
              
              if (highlightLayerRef.current) {
                allMeshes.forEach((m: BABYLON.Mesh) => {
                  highlightLayerRef.current!.addMesh(m, BABYLON.Color3.FromHexString('#4A90E2'))
                })
                setSelectedParts(new Set(allMeshes))
              }
            } else {
              // Regular single mesh selection
              if (highlightLayerRef.current) {
                highlightLayerRef.current.addMesh(mesh, BABYLON.Color3.FromHexString('#4A90E2'))
                setSelectedParts(new Set([mesh]))
              }
            }
          }
          
          const togglePartSelection = (mesh: BABYLON.Mesh) => {
            // If in parts mode, toggle the entire part group
            if ((mesh as any).partGroup) {
              const partGroup = (mesh as any).partGroup
              const allMeshes = (partGroup as any).allMeshes || [partGroup.mesh]
              
              setSelectedParts(prev => {
                const newSet = new Set(prev)
                const isSelected = allMeshes.some((m: BABYLON.Mesh) => newSet.has(m))
                
                if (isSelected) {
                  // Remove all meshes in group
                  allMeshes.forEach((m: BABYLON.Mesh) => {
                    newSet.delete(m)
                    highlightLayerRef.current?.removeMesh(m)
                  })
                } else {
                  // Add all meshes in group
                  allMeshes.forEach((m: BABYLON.Mesh) => {
                    newSet.add(m)
                    highlightLayerRef.current?.addMesh(m, BABYLON.Color3.FromHexString('#4A90E2'))
                  })
                }
                return newSet
              })
            } else {
              // Regular toggle
              setSelectedParts(prev => {
                const newSet = new Set(prev)
                if (newSet.has(mesh)) {
                  newSet.delete(mesh)
                  highlightLayerRef.current?.removeMesh(mesh)
                } else {
                  newSet.add(mesh)
                  highlightLayerRef.current?.addMesh(mesh, BABYLON.Color3.FromHexString('#4A90E2'))
                }
                return newSet
              })
            }
          }
          
          const clearAllSelections = () => {
            selectedParts.forEach(mesh => {
              highlightLayerRef.current?.removeMesh(mesh)
            })
            setSelectedParts(new Set())
          }
          
          const selectPartsInBox = (
            scene: BABYLON.Scene,
            parts: BABYLON.Mesh[],
            start: {x: number, y: number},
            end: {x: number, y: number},
            canvas: HTMLCanvasElement
          ) => {
            const rect = canvas.getBoundingClientRect()
            const minX = Math.min(start.x - rect.left, end.x - rect.left)
            const maxX = Math.max(start.x - rect.left, end.x - rect.left)
            const minY = Math.min(start.y - rect.top, end.y - rect.top)
            const maxY = Math.max(start.y - rect.top, end.y - rect.top)
            
            clearAllSelections()
            const newSelection = new Set<BABYLON.Mesh>()
            
            parts.forEach(mesh => {
              const boundingInfo = mesh.getBoundingInfo()
              const boundingBox = boundingInfo.boundingBox
              const worldMatrix = mesh.getWorldMatrix()
              
              // Check if mesh center is in selection box
              const center = boundingBox.centerWorld
              const screenPos = BABYLON.Vector3.Project(
                center,
                worldMatrix,
                scene.getTransformMatrix(),
                scene.activeCamera!.viewport
              )
              
              const screenX = screenPos.x * canvas.width
              const screenY = screenPos.y * canvas.height
              
              if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
                highlightLayerRef.current?.addMesh(mesh, BABYLON.Color3.FromHexString('#4A90E2'))
                newSelection.add(mesh)
              }
            })
            
            setSelectedParts(newSelection)
          }

          // Notify parent
          if (onGeometryUpdate) {
            onGeometryUpdate(loadedMesh)
          }
        }
      )
    }

    // Handle view mode changes
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as BABYLON.StandardMaterial
      mat.wireframe = viewMode === 'wireframe'
    }

    // Render loop
    engine.runRenderLoop(() => {
      scene.render()
    })

    // Handle resize
    const handleResize = () => {
      engine.resize()
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      engine.dispose()
    }
  }, [showGrid, viewMode, modelUrl, material])

  // Helper functions for grouping mesh fragments
  const groupMeshFragments = (meshes: BABYLON.Mesh[], scene: BABYLON.Scene) => {
    const groups: Array<{name: string, type: CarPart['type'], meshes: BABYLON.Mesh[]}> = []
    const processed = new Set<BABYLON.Mesh>()
    
    // First, try to identify wheels (usually 4 similar groups at corners)
    const potentialWheels: BABYLON.Mesh[][] = []
    
    meshes.forEach(mesh => {
      if (processed.has(mesh)) return
      
      const bounds = mesh.getBoundingInfo().boundingBox
      const center = bounds.center
      
      // Check if this could be part of a wheel (near ground, at corners)
      if (Math.abs(center.y) < 2) {
        // Find nearby fragments that could be part of same wheel
        const wheelGroup = meshes.filter(m => {
          if (processed.has(m)) return false
          const mBounds = m.getBoundingInfo().boundingBox
          const dist = BABYLON.Vector3.Distance(center, mBounds.center)
          return dist < 2 // Within 2 units
        })
        
        if (wheelGroup.length > 5) { // Wheels usually have multiple fragments
          potentialWheels.push(wheelGroup)
          wheelGroup.forEach(m => processed.add(m))
        }
      }
    })
    
    // Add wheel groups
    potentialWheels.slice(0, 4).forEach((wheel, i) => {
      groups.push({
        name: `wheel_${i + 1}`,
        type: 'wheel',
        meshes: wheel
      })
    })
    
    // Group remaining fragments by proximity
    meshes.forEach(mesh => {
      if (processed.has(mesh)) return
      
      const bounds = mesh.getBoundingInfo().boundingBox
      const center = bounds.center
      const name = mesh.name.toLowerCase()
      
      // Determine type based on name or position
      let type: CarPart['type'] = 'body'
      if (name.includes('door')) type = 'door'
      else if (name.includes('window')) type = 'window'
      else if (name.includes('spoiler')) type = 'spoiler'
      else if (center.y > 3) type = 'spoiler' // High parts might be spoiler
      
      // Find nearby fragments of same type
      const group = meshes.filter(m => {
        if (processed.has(m)) return false
        const mName = m.name.toLowerCase()
        const mBounds = m.getBoundingInfo().boundingBox
        const dist = BABYLON.Vector3.Distance(center, mBounds.center)
        
        // Group if same type and close proximity
        return dist < 3 && (
          mName.includes(name.split('_')[0]) ||
          (type === 'body' && !mName.includes('door') && !mName.includes('window'))
        )
      })
      
      if (group.length > 0) {
        group.forEach(m => processed.add(m))
        groups.push({
          name: `${type}_${groups.length}`,
          type: type,
          meshes: group
        })
      }
    })
    
    // Group any remaining ungrouped meshes as body
    const ungrouped = meshes.filter(m => !processed.has(m))
    if (ungrouped.length > 0) {
      groups.push({
        name: 'body_main',
        type: 'body',
        meshes: ungrouped
      })
    }
    
    return groups
  }
  
  const calculateCombinedBounds = (meshes: BABYLON.Mesh[]) => {
    if (meshes.length === 0) return new BABYLON.BoundingBox(BABYLON.Vector3.Zero(), BABYLON.Vector3.One())
    
    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
    
    meshes.forEach(mesh => {
      const bounds = mesh.getBoundingInfo().boundingBox
      minX = Math.min(minX, bounds.minimum.x)
      minY = Math.min(minY, bounds.minimum.y)
      minZ = Math.min(minZ, bounds.minimum.z)
      maxX = Math.max(maxX, bounds.maximum.x)
      maxY = Math.max(maxY, bounds.maximum.y)
      maxZ = Math.max(maxZ, bounds.maximum.z)
    })
    
    return new BABYLON.BoundingBox(
      new BABYLON.Vector3(minX, minY, minZ),
      new BABYLON.Vector3(maxX, maxY, maxZ)
    )
  }

  // Handle SAM selection mode
  useEffect(() => {
    if (selectedTool === 'sam' && samSegmenterRef.current && sceneRef.current) {
      setIsSAMMode(true)
      setSamPoints([])
      setSamSegments([])
      
      // Clear any existing selections
      if (highlightLayerRef.current) {
        selectedParts.forEach(mesh => {
          highlightLayerRef.current!.removeMesh(mesh)
        })
        setSelectedParts(new Set())
      }
      
      // Add keyboard listeners for SAM mode
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          // Clear all SAM points
          setSamPoints([])
          setSamSegments([])
          if (highlightLayerRef.current) {
            selectedParts.forEach(mesh => {
              highlightLayerRef.current!.removeMesh(mesh)
            })
            setSelectedParts(new Set())
          }
        } else if (e.key === 'Enter' && samSegments.length > 0) {
          // Confirm selection - keep the selection active
        }
      }
      
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    } else if (isSAMMode) {
      setIsSAMMode(false)
      setSamPoints([])
      setSamSegments([])
    }
  }, [selectedTool, samSegments, selectedParts])

  // Trigger mesh segmentation when parts tool is selected
  useEffect(() => {
    if (selectedTool === 'parts' && !isSegmented) {
      if (meshRef.current && sceneRef.current) {
        // Get all mesh fragments
        const allMeshes = sceneRef.current.meshes.filter(m => 
          m instanceof BABYLON.Mesh && 
          m.name !== 'ground' && 
          m.name !== 'grid' &&
          m.getTotalVertices() > 0
        ) as BABYLON.Mesh[]
        
        // Group fragments by proximity and type
        const groupedParts = groupMeshFragments(allMeshes, sceneRef.current)
        
        // Convert grouped meshes to CarParts
        const simpleParts: CarPart[] = groupedParts.map((group, index) => {
          const combinedBounds = calculateCombinedBounds(group.meshes)
          const totalVertices = group.meshes.reduce((sum, m) => sum + m.getTotalVertices(), 0)
          
          return {
            name: group.name,
            mesh: group.meshes[0], // Use first mesh as representative
            type: group.type,
            bounds: combinedBounds,
            vertices: totalVertices,
            // Store all meshes in the group
            allMeshes: group.meshes
          } as CarPart & { allMeshes: BABYLON.Mesh[] }
        })
        
        setCarParts(simpleParts)
        setIsSegmented(true)
        
        // Make all parts selectable and add visual feedback
        simpleParts.forEach(part => {
          const allMeshes = (part as any).allMeshes || [part.mesh];
          allMeshes.forEach((mesh: BABYLON.Mesh) => {
            mesh.isPickable = true;
            mesh.enableEdgesRendering();
            mesh.edgesWidth = 1.0;
            mesh.edgesColor = new BABYLON.Color4(0.2, 0.2, 0.2, 0.3);
            
            // Store group reference on each mesh
            const meshAny = mesh as any;
            meshAny.partGroup = part;
          });
        });
      }
    } else if (selectedTool !== 'parts' && isSegmented) {
      // Restore original view when switching away from parts tool
      carParts.forEach(part => {
        const allMeshes = (part as any).allMeshes || [part.mesh];
        allMeshes.forEach((mesh: BABYLON.Mesh) => {
          mesh.disableEdgesRendering();
          const meshAny = mesh as any;
          delete meshAny.partGroup;
        });
      });
      // Clear any selections
      if (highlightLayerRef.current) {
        selectedParts.forEach(mesh => {
          highlightLayerRef.current!.removeMesh(mesh);
        });
      }
      setSelectedParts(new Set());
      setCarParts([]);
      setIsSegmented(false);
    }
  }, [selectedTool, isSegmented])

  // Create axis indicator scene
  useEffect(() => {
    if (!axisCanvasRef.current) return

    const engine = new BABYLON.Engine(axisCanvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })

    const scene = new BABYLON.Scene(engine)
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0) // Transparent background
    axisSceneRef.current = scene

    // Camera for axis view
    const camera = new BABYLON.ArcRotateCamera(
      'axisCamera',
      cameraAlpha,
      cameraBeta,
      5,
      BABYLON.Vector3.Zero(),
      scene
    )

    // Light for axis view
    const light = new BABYLON.HemisphericLight('axisLight', new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 1

    // Create axis lines
    // X axis - Red
    const xAxis = BABYLON.MeshBuilder.CreateLines('xAxis', {
      points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(1.5, 0, 0)]
    }, scene)
    xAxis.color = new BABYLON.Color3(1, 0.3, 0.3)

    // Y axis - Green  
    const yAxis = BABYLON.MeshBuilder.CreateLines('yAxis', {
      points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 1.5, 0)]
    }, scene)
    yAxis.color = new BABYLON.Color3(0.3, 1, 0.3)

    // Z axis - Blue
    const zAxis = BABYLON.MeshBuilder.CreateLines('zAxis', {
      points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 1.5)]
    }, scene)
    zAxis.color = new BABYLON.Color3(0.3, 0.3, 1)

    // Add cones for arrow tips
    const xCone = BABYLON.MeshBuilder.CreateCylinder('xCone', {
      height: 0.3,
      diameterTop: 0,
      diameterBottom: 0.2
    }, scene)
    xCone.position = new BABYLON.Vector3(1.5, 0, 0)
    xCone.rotation.z = -Math.PI / 2
    const xMat = new BABYLON.StandardMaterial('xMat', scene)
    xMat.emissiveColor = new BABYLON.Color3(1, 0.3, 0.3)
    xCone.material = xMat

    const yCone = BABYLON.MeshBuilder.CreateCylinder('yCone', {
      height: 0.3,
      diameterTop: 0,
      diameterBottom: 0.2
    }, scene)
    yCone.position = new BABYLON.Vector3(0, 1.5, 0)
    const yMat = new BABYLON.StandardMaterial('yMat', scene)
    yMat.emissiveColor = new BABYLON.Color3(0.3, 1, 0.3)
    yCone.material = yMat

    const zCone = BABYLON.MeshBuilder.CreateCylinder('zCone', {
      height: 0.3,
      diameterTop: 0,
      diameterBottom: 0.2
    }, scene)
    zCone.position = new BABYLON.Vector3(0, 0, 1.5)
    zCone.rotation.x = Math.PI / 2
    const zMat = new BABYLON.StandardMaterial('zMat', scene)
    zMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 1)
    zCone.material = zMat

    engine.runRenderLoop(() => {
      scene.render()
    })

    return () => {
      engine.dispose()
    }
  }, [])

  // Update axis indicator camera when main camera moves
  useEffect(() => {
    if (axisSceneRef.current && axisSceneRef.current.activeCamera) {
      const camera = axisSceneRef.current.activeCamera as BABYLON.ArcRotateCamera
      camera.alpha = cameraAlpha
      camera.beta = cameraBeta
    }
  }, [cameraAlpha, cameraBeta])

  // Public methods for mesh operations
  useEffect(() => {
    if (!sceneRef.current || !meshRef.current) return

    // Expose methods for parent components
    const mesh = meshRef.current

    // Delete faces operation
    window.babylonDeleteSelected = () => {
      if (mesh && selectedFaces.size > 0) {
        // Actual face deletion would go here
      }
    }

    // Smooth operation
    window.babylonSmoothMesh = () => {
      if (mesh) {
        // Smoothing operation would go here
      }
    }
    
    // Highlight parts operation
    window.babylonHighlightParts = () => {
      if (highlightLayerRef.current) {
        // Toggle highlight on all parts
        const allMeshes = sceneRef.current?.meshes.filter(m => 
          m instanceof BABYLON.Mesh && 
          m.name !== 'ground' && 
          m.name !== 'grid'
        ) as BABYLON.Mesh[]
        
        if (selectedParts.size === 0) {
          // If nothing selected, highlight all parts
          allMeshes?.forEach(mesh => {
            highlightLayerRef.current?.addMesh(mesh, BABYLON.Color3.FromHexString('#FFA500'))
          })
          setSelectedParts(new Set(allMeshes || []))
        } else {
          // Clear highlights
          selectedParts.forEach(mesh => {
            highlightLayerRef.current?.removeMesh(mesh)
          })
          setSelectedParts(new Set())
        }
      }
    }

    // Boolean operations
    window.babylonBooleanUnion = () => {
      if (!mesh || !sceneRef.current) return
      
      const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2 }, sceneRef.current)
      sphere.position.y = 2
      
      const csg1 = BABYLON.CSG.FromMesh(mesh)
      const csg2 = BABYLON.CSG.FromMesh(sphere)
      const union = csg1.union(csg2)
      
      const result = union.toMesh('union', mesh.material, sceneRef.current)
      mesh.dispose()
      sphere.dispose()
      meshRef.current = result
    }

    window.babylonBooleanSubtract = () => {
      if (!mesh || !sceneRef.current) return
      
      const box = BABYLON.MeshBuilder.CreateBox('box', { size: 2 }, sceneRef.current)
      box.position.x = 2
      
      const csg1 = BABYLON.CSG.FromMesh(mesh)
      const csg2 = BABYLON.CSG.FromMesh(box)
      const subtract = csg1.subtract(csg2)
      
      const result = subtract.toMesh('subtract', mesh.material, sceneRef.current)
      mesh.dispose()
      box.dispose()
      meshRef.current = result
    }
  }, [selectedFaces])

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full ${selectedTool === 'parts' ? 'cursor-pointer' : ''}`}
        style={{ display: 'block', outline: 'none' }}
      />
      
      {/* Selection Box Overlay */}
      {isDrawingSelection && selectionBox && (
        <div
          className="absolute border-2 border-blue-400 bg-blue-400/10 pointer-events-none"
          style={{
            left: Math.min(selectionBox.start.x, selectionBox.end.x),
            top: Math.min(selectionBox.start.y, selectionBox.end.y),
            width: Math.abs(selectionBox.end.x - selectionBox.start.x),
            height: Math.abs(selectionBox.end.y - selectionBox.start.y),
          }}
        />
      )}
      
      {/* SAM Selection Points */}
      {selectedTool === 'sam' && samPoints.map((point, index) => (
        <div
          key={index}
          className={`absolute w-4 h-4 rounded-full border-2 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 ${
            point.label === 1 
              ? 'bg-green-400 border-green-600' 
              : 'bg-red-400 border-red-600'
          }`}
          style={{
            left: point.x,
            top: point.y,
          }}
        >
          <div className={`absolute inset-0 rounded-full animate-ping ${
            point.label === 1 ? 'bg-green-400' : 'bg-red-400'
          } opacity-25`} />
        </div>
      ))}
      
      {/* Selection Instructions - Only in Edit Mode */}
      {isEditMode && (
        <div className="absolute top-4 left-4 text-xs text-gray-400 pointer-events-none">
          {selectedTool === 'sam' ? (
            <>
              <div className="text-blue-400 font-medium mb-2">AI Selection Mode</div>
              <div>Click: Add selection point</div>
              <div>Shift+Click: Add exclusion point</div>
              <div>ESC: Clear points</div>
              <div>Enter: Confirm selection</div>
            </>
          ) : (
            <>
              <div>Click: Select part</div>
              <div>Ctrl/Cmd + Click: Multi-select</div>
              <div>Shift + Drag: Box select</div>
              <div>Click empty: Clear selection</div>
              {selectedTool === 'parts' && (
                <div className="mt-2 text-blue-400">Part Selection Active</div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Selection Count */}
      {selectedParts.size > 0 && (
        <div className="absolute top-4 right-4 text-sm text-blue-400 pointer-events-none">
          {selectedParts.size} part{selectedParts.size > 1 ? 's' : ''} selected
        </div>
      )}
      
      {/* Parts List when in parts mode */}
      {selectedTool === 'parts' && carParts.length > 0 && (
        <div className="absolute top-20 right-4 bg-black/80 border border-white/10 backdrop-blur-sm p-3 text-xs text-gray-400 pointer-events-none max-w-[200px]">
          <div className="text-white mb-2">Identified Parts:</div>
          {carParts.map(part => (
            <div key={part.name} className="flex justify-between py-1">
              <span>{part.name}</span>
              <span className="text-gray-500">{part.vertices} verts</span>
            </div>
          ))}
        </div>
      )}
      
      {/* SAM Selection Panel */}
      {selectedTool === 'sam' && (
        <div className="absolute bottom-20 left-4 bg-black/80 border border-white/10 backdrop-blur-sm p-3 text-xs">
          <div className="text-white mb-2 font-medium">AI Selection</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">Include: {samPoints.filter(p => p.label === 1).length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-gray-400">Exclude: {samPoints.filter(p => p.label === 0).length}</span>
            </div>
          </div>
          {samPoints.length > 0 && (
            <button
              onClick={() => {
                setSamPoints([])
                setSamSegments([])
                if (highlightLayerRef.current) {
                  selectedParts.forEach(mesh => {
                    highlightLayerRef.current!.removeMesh(mesh)
                  })
                  setSelectedParts(new Set())
                }
              }}
              className="px-3 py-1 bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30 transition-colors text-xs"
            >
              Clear Points (ESC)
            </button>
          )}
        </div>
      )}
      
      {/* XYZ Axis Indicator - Bottom Right Corner (Dynamic 3D) */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <canvas
          ref={axisCanvasRef}
          width="100"
          height="100"
          className="opacity-80"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  )
}

// Extend window interface for operations
declare global {
  interface Window {
    babylonDeleteSelected: () => void
    babylonSmoothMesh: () => void
    babylonHighlightParts: () => void
    babylonBooleanUnion: () => void
    babylonBooleanSubtract: () => void
  }
}
