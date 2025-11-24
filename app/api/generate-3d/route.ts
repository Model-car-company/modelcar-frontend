import { NextRequest, NextResponse } from 'next/server'

const FAL_API_KEY = process.env.FAL_API_KEY
const FAL_QUEUE_ENDPOINT = 'https://queue.fal.run/fal-ai/bytedance/seed3d/image-to-3d'

export async function POST(request: NextRequest) {
  try {
    // Handle both FormData and JSON requests
    const contentType = request.headers.get('content-type')
    let image: string | File | null = null
    let prompt: string = ''
    let quality: string = 'standard'
    let provider: string = 'meshy'
    
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

    // Use fal.ai Seed3D for 3D generation
    const result = await generateWithSeed3D(image, prompt)
    return NextResponse.json(result)

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate 3D model' },
      { status: 500 }
    )
  }
}

// 3D Generation with fal.ai Seed3D
async function generateWithSeed3D(image: string | File, prompt: string) {
  if (!FAL_API_KEY) {
    throw new Error('fal.ai API key not configured')
  }
  if (typeof image !== 'string') {
    throw new Error('image must be a public URL string for Seed3D')
  }

  // Step 1: Submit request to fal queue
  const start = await fetch(FAL_QUEUE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: image,
      prompt: prompt || ''
    })
  })

  if (!start.ok) {
    const msg = await start.text()
    throw new Error(`fal.ai queue error: ${msg}`)
  }

  const started = await start.json()
  const statusUrl: string = started.status_url
  const responseUrl: string = started.response_url

  // Step 2: Poll for completion using provided URLs
  const maxAttempts = 180
  for (let i = 0; i < maxAttempts; i++) {
    // Try fetching response directly
    const resp = await fetch(responseUrl, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })
    if (resp.ok) {
      const result = await resp.json()
      const zipUrl: string | undefined = result?.model?.url
      if (zipUrl) {
        return {
          success: true,
          modelUrl: zipUrl,
          format: 'zip',
          provider: 'seed3d-fal',
          metadata: {
            usageTokens: result?.usage_tokens,
          }
        }
      }
    }

    // Check status as fallback
    const statusResp = await fetch(statusUrl, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })
    if (statusResp.ok) {
      const status = await statusResp.json()
      if (status.status && ['COMPLETED', 'completed', 'succeeded', 'SUCCEEDED'].includes(status.status)) {
        // loop will fetch response next iteration; continue
      } else if (status.status && ['FAILED', 'failed', 'canceled', 'CANCELED'].includes(status.status)) {
        throw new Error('Seed3D generation failed')
      }
    }

    await new Promise(r => setTimeout(r, 2000))
  }

  throw new Error('Seed3D generation timed out')
}


// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: '3D Generation API is online',
    integrations: {
      metaSAM: 'pending', // Will be 'connected' when integrated
      fallback: 'luma-ai' // Alternative if Meta SAM not available
    }
  })
}
