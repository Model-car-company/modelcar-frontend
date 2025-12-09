import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    // Handle both FormData and JSON requests
    const contentType = request.headers.get('content-type')
    let image: string | File | null = null
    let prompt: string = ''
    let quality: string = 'standard'
    let provider: string = 'synexa'
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      image = formData.get('image') as File
      prompt = formData.get('prompt') as string || ''
      quality = formData.get('quality') as string || 'standard'
      provider = formData.get('provider') as string || 'synexa'
    } else {
      const json = await request.json()
      image = json.image // Base64 string
      prompt = json.prompt || ''
      quality = json.quality || 'standard'
      provider = json.provider || 'synexa'
    }

    if (!image && !prompt) {
      return NextResponse.json(
        { error: 'Either image or prompt is required' },
        { status: 400 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required for 3D generation' },
        { status: 400 }
      )
    }

    if (!BACKEND_URL) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    // For our backend we require a public image URL
    if (typeof image !== 'string') {
      return NextResponse.json({ error: 'image must be a public URL string' }, { status: 400 })
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('Authorization')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const resp = await fetch(`${BACKEND_URL}/api/v1/external/generate-3d`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ image_url: image, prompt })
    })

    if (!resp.ok) {
      if (resp.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Generation failed' }, { status: resp.status })
    }

    const data = await resp.json()
    
    // Handle different response formats from backend
    // Backend might return: {modelUrl} or {model_url} or {url} or {models: [{url}]}
    const modelUrl = data.modelUrl || data.model_url || data.url || data.models?.[0]?.url
    const format = data.format || 'glb'
    
    if (!modelUrl) {
      return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }
    
    // Return the model URL - frontend will save to user_assets and use asset ID for Studio
    return NextResponse.json({ 
      success: true, 
      modelUrl, 
      format,
      ...data 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate 3D model' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
