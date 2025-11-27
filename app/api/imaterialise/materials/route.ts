import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/printing/filaments`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    const filaments = data.filaments || []
    
    // Group filaments by profile (PLA, PETG, etc.)
    const materialsMap = new Map()

    filaments.forEach((f: any) => {
      const materialType = f.profile || 'Standard'
      
      if (!materialsMap.has(materialType)) {
        materialsMap.set(materialType, {
          materialID: materialType,
          materialName: materialType,
          technology: 'FDM 3D Printing',
          finishes: []
        })
      }

      const material = materialsMap.get(materialType)
      
      // Clean up finish name
      let finishName = f.color || f.name
      // Remove prefix if present (e.g. "PLA BROWN" -> "Brown")
      if (f.name && f.name.toUpperCase().startsWith(materialType.toUpperCase() + ' ')) {
        finishName = f.name.substring(materialType.length + 1)
      } else if (f.color) {
          finishName = f.color
      }
      
      // Title case
      finishName = finishName.toLowerCase().split(' ').map((word: string) => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')

      material.finishes.push({
        finishID: f.publicId, // This is the filament UUID we need for ordering
        finishName: finishName,
        description: f.name,
        hexValue: f.hexValue,
        lead_time_days: 4
      })
    })

    const materials = Array.from(materialsMap.values())
    
    return NextResponse.json({ 
      materials,
      count: materials.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    })
    
  } catch (error: any) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials', details: error.message },
      { status: 500 }
    )
  }
}
