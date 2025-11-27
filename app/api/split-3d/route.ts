import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      )
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('Authorization')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const resp = await fetch(`${BACKEND_URL}/api/v1/external/split-3d`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: 'Backend split-3d failed', details: text }, { status: resp.status })
    }

    const data = await resp.json()
    
    // Handle different response formats
    const modelUrl = data.modelUrl || data.model_url || data.url
    
    return NextResponse.json({ 
      success: true, 
      modelUrl,
      ...data 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to split 3D model' },
      { status: 500 }
    )
  }
}
