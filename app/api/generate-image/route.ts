import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Backend URL for ATELIER API
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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
    const { prompt, previousImage } = await request.json()

    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: 'Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL in .env' },
        { status: 500 }
      )
    }

    // Call backend external endpoint
    const resp = await fetch(`${BACKEND_URL}/api/v1/external/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, previousImage, aspect_ratio: '16:9', output_format: 'jpg' })
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: 'Backend image generation failed', details: text }, { status: resp.status })
    }

    const { imageUrl, prompt: enhancedPrompt } = await resp.json()
    
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
