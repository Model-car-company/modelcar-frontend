import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY
const REPLICATE_SAM2_VERSION = process.env.REPLICATE_SAM2_VERSION || 'cbd95fb76192174268b6b303aeeb7a736e8dab0cbc38177f09db79b2299da30b'

export async function POST(request: NextRequest) {
  try {
    const { image, points } = await request.json()
    
    if (!REPLICATE_API_KEY) {
      return NextResponse.json(
        { error: 'Segmentation unavailable: set REPLICATE_API_KEY in .env' },
        { status: 500 }
      )
    }

    // Create SAM2 prediction on Replicate
    const start = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: REPLICATE_SAM2_VERSION,
        input: {
          image,
          points: points?.map((p: any) => ({ x: p.x, y: p.y, label: p.label })) || []
        }
      })
    })

    if (!start.ok) {
      const err = await start.text()
      return NextResponse.json({ error: 'Failed to start segmentation', details: err }, { status: 500 })
    }

    const started = await start.json()
    const predictionId = started.id

    // Poll Replicate for completion
    let attempts = 0
    const maxAttempts = 60
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 1000))
      const statusResp = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        }
      })
      const status = await statusResp.json()
      if (status.status === 'succeeded') {
        const out: any = status.output
        const segmentedImage = (out && typeof out === 'object')
          ? (out.image || (Array.isArray(out) ? out[0] : out.url || out.mask || out))
          : out
        const masks = (out && typeof out === 'object' && Array.isArray(out.masks)) ? out.masks : []
        return NextResponse.json({ 
          segmentedImage,
          masks,
          raw: status
        })
      } else if (status.status === 'failed' || status.status === 'canceled') {
        return NextResponse.json({ error: 'Segmentation failed' }, { status: 500 })
      }
      attempts++
    }
    return NextResponse.json({ error: 'Segmentation timed out' }, { status: 504 })
    
  } catch (error) {
    console.error('Segmentation error:', error)
    return NextResponse.json(
      { error: 'Failed to segment image' },
      { status: 500 }
    )
  }
}

function generateMockMasks(points: any[], imageBase64: string) {
  // For development: Generate mock masks based on click points
  return points.map((point, index) => ({
    id: `mask_${index}`,
    bbox: {
      x: Math.max(0, point.x - 100),
      y: Math.max(0, point.y - 100),
      width: 200,
      height: 200
    },
    confidence: 0.95 + Math.random() * 0.05,
    // Mock mask data - in production this would be actual segmentation
    data: generateMockMaskData(point)
  }))
}

function generateMockMaskData(point: any) {
  // Create a simple circular mask for testing
  const size = 512
  const mask = new Array(size * size).fill(0)
  const centerX = point.x
  const centerY = point.y
  const radius = 50
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      if (dist < radius) {
        mask[y * size + x] = 255
      }
    }
  }
  
  return mask
}
