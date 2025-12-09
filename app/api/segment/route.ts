import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    const { image, points } = await request.json()
    
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 500 }
      )
    }

    // Convert percentage points (0-100) to normalized (0-1) for backend
    const normalizedPoints = points?.map((p: any) => ({ 
      x: p.x / 100, 
      y: p.y / 100, 
      label: p.label 
    })) || []

    // Forward authorization header if present
    const authHeader = request.headers.get('Authorization')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Call backend segmentation endpoint
    const response = await fetch(`${BACKEND_URL}/api/v1/external/segment-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        image_url: image,
        points: normalizedPoints
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Segmentation failed' }, { status: response.status })
    }

    const data = await response.json()
    
    // Handle different response formats
    const segmentedImage = data.maskUrl || data.mask_url || data.segmentedImage || data.url
    
    if (!segmentedImage) {
      return NextResponse.json({ error: 'Segmentation failed' }, { status: 500 })
    }
    
    // Return in format expected by frontend (segmentedImage = mask URL)
    return NextResponse.json({ 
      segmentedImage,
      provider: data.provider
    })
    
  } catch {
    return NextResponse.json(
      { error: 'Failed to segment image' },
      { status: 500 }
    )
  }
}
