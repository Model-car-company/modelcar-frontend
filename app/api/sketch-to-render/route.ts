import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!BACKEND_URL) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // Forward authorization header if present
    const authHeader = req.headers.get('Authorization')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Proxy to backend sketch-to-render endpoint
    const response = await fetch(`${BACKEND_URL}/api/v1/external/sketch-to-render`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Render failed' }, { status: response.status })
    }

    const data = await response.json()
    
    // Handle different response formats
    const imageUrl = data.imageUrl || data.image_url || data.url || data.images?.[0]?.url
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Render failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      asset: data.asset,
      ...data
    })

  } catch {
    return NextResponse.json(
      { error: 'Failed to render sketch' },
      { status: 500 }
    )
  }
}
