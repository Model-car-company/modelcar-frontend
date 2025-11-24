import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// SECURITY: Only use server-side env variable, never NEXT_PUBLIC_
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Replicate FLUX Pro
const REPLICATE_MODELS_FLUX_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions'

// Lazily create Supabase client when needed
function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null
  if (!/^https?:\/\//.test(SUPABASE_URL)) return null
  try {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, previousImage, chatHistory } = await request.json()

    if (!REPLICATE_API_KEY) {
      return NextResponse.json(
        { error: 'No image provider configured. Set REPLICATE_API_KEY in .env' },
        { status: 500 }
      )
    }

    // Build the prompt for car generation
    const enhancedPrompt = previousImage
      ? `Based on the previous car design, ${prompt}. Maintain the overall style and make only the requested changes. High quality, photorealistic, 4K resolution.`
      : `Generate a highly detailed, photorealistic image of a car: ${prompt}. Professional automotive photography style, studio lighting, dramatic 3/4 view angle, clean background, 4K quality, sharp focus.`

    // Image generation started
    let imageUrl: string | null = null

    // Prefer Replicate FLUX if configured
    if (REPLICATE_API_KEY) {
      const start = await fetch(REPLICATE_MODELS_FLUX_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${REPLICATE_API_KEY}`,
        },
        body: JSON.stringify({
          input: {
            prompt: enhancedPrompt,
            aspect_ratio: '16:9',
            output_format: 'jpg',
          }
        }),
      })

      if (!start.ok) {
        const errorText = await start.text()
        return NextResponse.json(
          { error: 'Failed to start image generation (Replicate)', details: errorText },
          { status: start.status }
        )
      }

      const started = await start.json()
      const predictionId = started.id

      // Poll Replicate until completed
      let attempts = 0
      const maxAttempts = 60
      while (!imageUrl && attempts < maxAttempts) {
        const statusResp = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${REPLICATE_API_KEY}`,
            'Content-Type': 'application/json',
          }
        })
        const status = await statusResp.json()
        if (status.status === 'succeeded') {
          // Replicate output for FLUX is an array of URLs
          const out = status.output
          imageUrl = Array.isArray(out) ? out[0] : (typeof out === 'string' ? out : null)
          break
        } else if (status.status === 'failed' || status.status === 'canceled') {
          return NextResponse.json(
            { error: 'Image generation failed (Replicate)' },
            { status: 500 }
          )
        }
        await new Promise(r => setTimeout(r, 1000))
        attempts++
      }
    }

    // No fallback provider; enforce two-API architecture (Replicate + fal.ai)

    if (!imageUrl) {
      throw new Error('Image generation timed out')
    }
    
    // Download the image from the generated URL
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // If Supabase env is not configured (e.g., build-time), return raw URL
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ success: true, imageUrl, prompt: enhancedPrompt, model: 'flux-1.1-pro' })
    }

    // Generate unique filename and upload
    const fileName = `generated/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(fileName, imageBuffer, { contentType: 'image/jpeg', cacheControl: '3600' })
    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      // Fall back to returning the external URL
      return NextResponse.json({ success: true, imageUrl, prompt: enhancedPrompt, model: 'flux-1.1-pro' })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ success: true, imageUrl: publicUrl, prompt: enhancedPrompt, model: 'flux-1.1-pro' })

  } catch (error: any) {
    // Generation error occurred
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        message: error.message,
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
