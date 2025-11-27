import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
      return NextResponse.json({ error: 'Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL' }, { status: 500 })
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
      const text = await resp.text()
      
      if (resp.status === 401) {
        return NextResponse.json({ 
          error: 'Backend Authentication Failed', 
          details: 'The backend rejected the authentication token (401).' 
        }, { status: 401 })
      }
      
      return NextResponse.json({ error: 'Backend 3D generation failed', details: text }, { status: resp.status })
    }

    const data = await resp.json()
    
    // Handle different response formats from backend
    // Backend might return: {modelUrl} or {model_url} or {url} or {models: [{url}]}
    const externalModelUrl = data.modelUrl || data.model_url || data.url || data.models?.[0]?.url
    const format = data.format || 'glb'
    
    if (!externalModelUrl) {
      return NextResponse.json({ 
        error: 'No model URL in backend response', 
        details: JSON.stringify(data) 
      }, { status: 500 })
    }
    
    // Download the model from external provider and re-upload to Supabase storage
    // This hides the external provider URL from the client
    let modelUrl = externalModelUrl
    
    if (SUPABASE_SERVICE_KEY) {
      try {
        // Download the GLB file
        const modelResponse = await fetch(externalModelUrl)
        if (modelResponse.ok) {
          const modelBlob = await modelResponse.blob()
          const modelBuffer = Buffer.from(await modelBlob.arrayBuffer())
          
          // Create Supabase admin client
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
          
          // Generate unique filename
          const fileName = `models/${Date.now()}_${Math.random().toString(36).substring(7)}.${format}`
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('assets')
            .upload(fileName, modelBuffer, {
              contentType: format === 'glb' ? 'model/gltf-binary' : 'application/octet-stream',
              upsert: false
            })
          
          if (!uploadError && uploadData) {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('assets')
              .getPublicUrl(fileName)
            
            modelUrl = publicUrl
          }
        }
      } catch (uploadErr) {
        // If upload fails, fall back to external URL (not ideal but keeps things working)
        console.error('Failed to re-upload model to Supabase:', uploadErr)
      }
    }
    
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
  return NextResponse.json({
    status: 'ready',
    message: '3D Generation API is online',
    integrations: { backend: BACKEND_URL ? 'connected' : 'not-configured' }
  })
}
