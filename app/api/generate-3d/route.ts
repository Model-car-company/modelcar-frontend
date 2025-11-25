import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    // Handle both FormData and JSON requests
    const contentType = request.headers.get('content-type')
    let image: string | File | null = null
    let prompt: string = ''
    let quality: string = 'standard'
    let provider: string = 'replicate'
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      image = formData.get('image') as File
      prompt = formData.get('prompt') as string || ''
      quality = formData.get('quality') as string || 'standard'
      provider = formData.get('provider') as string || 'meshy'
    } else {
      const json = await request.json()
      image = json.image // Base64 string
      prompt = json.prompt || ''
      quality = json.quality || 'standard'
      provider = json.provider || 'meshy'
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
      return NextResponse.json({ error: 'Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL' }, { status: 500 })
    }

    // For our backend we require a public image URL
    if (typeof image !== 'string') {
      return NextResponse.json({ error: 'image must be a public URL string' }, { status: 400 })
    }

    const resp = await fetch(`${BACKEND_URL}/api/v1/external/generate-3d`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: image, prompt, provider })
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: 'Backend 3D generation failed', details: text }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate 3D model' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: '3D Generation API is online',
    integrations: { backend: BACKEND_URL ? 'connected' : 'not-configured' }
  })
}
