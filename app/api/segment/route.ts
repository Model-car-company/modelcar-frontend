import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    const { image, points } = await request.json()
    
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: 'Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL in .env' },
        { status: 500 }
      )
    }

    // Convert percentage points (0-100) to normalized (0-1) for backend
    const normalizedPoints = points?.map((p: any) => ({ 
      x: p.x / 100, 
      y: p.y / 100, 
      label: p.label 
    })) || []

    // Call backend segmentation endpoint
    const response = await fetch(`${BACKEND_URL}/api/v1/external/segment-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: image,
        points: normalizedPoints
      })
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'Backend segmentation failed', details: err }, { status: response.status })
    }

    const data = await response.json()
    
    // Return in format expected by frontend (segmentedImage = mask URL)
    return NextResponse.json({ 
      segmentedImage: data.maskUrl,
      provider: data.provider
    })
    
  } catch (error) {
    console.error('Segmentation error:', error)
    return NextResponse.json(
      { error: 'Failed to segment image' },
      { status: 500 }
    )
  }
}
