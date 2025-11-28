import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Backend URL for Tangibel API
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
    const { prompt, previousImage, reference_images, aspect_ratio, output_format } = await request.json()

    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: 'Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL in .env' },
        { status: 500 }
      )
    }

    // Call backend external endpoint
    const authHeader = request.headers.get('Authorization')
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json' 
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Backend expects previousImage for reference-based generation
    // If previousImage not provided but reference_images array exists, use the first one
    const imageForReference = previousImage || (reference_images?.length > 0 ? reference_images[0] : undefined)

    const resp = await fetch(`${BACKEND_URL}/api/v1/external/generate-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        prompt, 
        previousImage: imageForReference,
        reference_images,
        aspect_ratio: aspect_ratio || '16:9', 
        output_format: output_format || 'jpg' 
      })
    })

    if (!resp.ok) {
      const text = await resp.text()
      
      if (resp.status === 401) {
        return NextResponse.json({ 
          error: 'Backend Authentication Failed', 
          details: 'The backend rejected the authentication token (401). This likely means the Backend is configured with a different Supabase Project/Secret than the Frontend.' 
        }, { status: 401 })
      }

      return NextResponse.json({ error: 'Backend image generation failed', details: text }, { status: resp.status })
    }

    const data = await resp.json()
    
    // Handle both response formats: {imageUrl} or {images: [{url}]}
    const imageUrl = data.imageUrl || data.images?.[0]?.url
    const enhancedPrompt = data.prompt || data.description || prompt
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'No image URL in backend response', 
        details: JSON.stringify(data) 
      }, { status: 500 })
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
