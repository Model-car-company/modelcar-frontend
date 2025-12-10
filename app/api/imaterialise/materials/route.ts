import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Fetch both Slant3D and Sculpteo materials in parallel
    const [slantRes, sculpteoRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/v1/printing/filaments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }),
      fetch(`${BACKEND_URL}/api/v1/printing/materials/sculpteo`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
    ])

    const materials: any[] = []

    // Process Slant3D filaments (group by profile)
    if (slantRes.ok) {
      const slantData = await slantRes.json()
      const filaments = slantData.filaments || []
      const materialsMap = new Map()

      filaments.forEach((f: any) => {
        const materialType = f.profile || 'Standard'
        
        if (!materialsMap.has(materialType)) {
          materialsMap.set(materialType, {
            materialID: materialType,
            materialName: materialType,
            technology: 'FDM 3D Printing',
            provider: 'slant3d',
            finishes: []
          })
        }

        const material = materialsMap.get(materialType)
        
        let finishName = f.color || f.name
        if (f.name && f.name.toUpperCase().startsWith(materialType.toUpperCase() + ' ')) {
          finishName = f.name.substring(materialType.length + 1)
        } else if (f.color) {
          finishName = f.color
        }
        
        finishName = finishName.toLowerCase().split(' ').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')

        material.finishes.push({
          finishID: f.publicId,
          finishName: finishName,
          description: f.name,
          hexValue: f.hexValue,
          lead_time_days: 4
        })
      })

      materials.push(...Array.from(materialsMap.values()))
    }

    // Process Sculpteo materials (group by technology)
    if (sculpteoRes.ok) {
      const sculpteoData = await sculpteoRes.json()
      const sculpteoMaterials = sculpteoData.materials || []
      const techMap = new Map()

      sculpteoMaterials.forEach((m: any) => {
        const tech = m.technology || 'Professional'
        
        if (!techMap.has(tech)) {
          techMap.set(tech, {
            materialID: `sculpteo_${tech}`,
            materialName: `${tech} (Premium)`,
            technology: tech,
            provider: 'sculpteo',
            finishes: []
          })
        }

        const material = techMap.get(tech)
        material.finishes.push({
          finishID: m.id,
          finishName: m.name,
          description: m.description,
          hexValue: m.color,
          lead_time_days: m.lead_time_days || 7,
          min_price_usd: m.min_price_usd
        })
      })

      materials.push(...Array.from(techMap.values()))
    }
    
    return NextResponse.json({ 
      materials,
      count: materials.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}
