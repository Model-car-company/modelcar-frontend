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
    
    // Transform to generic materials format (no provider info)
    const materials = (data.filaments || []).map((f: any) => ({
      id: f.publicId,
      name: f.name,
      type: f.profile || f.type,
      color: f.color,
      hexValue: f.hexValue,
      available: f.available
    }))
    
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
