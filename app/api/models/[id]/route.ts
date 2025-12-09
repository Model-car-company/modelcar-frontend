import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Disable Next.js caching for this route (large files)
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://tangibel.io',
  'https://www.tangibel.io',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[]

function getCorsOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin')
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin
  }
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development' && origin?.includes('localhost')) {
    return origin
  }
  return ALLOWED_ORIGINS[0] || ''
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id
    
    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 })
    }

    // Initialize Supabase client inside handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch the asset URL from database
    const { data, error } = await supabase
      .from('user_assets')
      .select('url, format')
      .eq('id', assetId)
      .single()
    
    if (error || !data?.url) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }


    // Fetch the model from the external URL
    const modelResponse = await fetch(data.url, {
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Tangibel-Studio/1.0'
      }
    })
    
    if (!modelResponse.ok) {
      return NextResponse.json({ error: 'Resource unavailable' }, { status: 502 })
    }

    // Get the model data
    const modelBuffer = await modelResponse.arrayBuffer()

    // Check if the file is valid (has content)
    if (modelBuffer.byteLength < 100) {
      return NextResponse.json({ error: 'Invalid resource' }, { status: 502 })
    }
    
    // Determine format from URL if not in database
    let format = data.format
    if (!format) {
      const urlLower = data.url.toLowerCase()
      if (urlLower.includes('.glb') || urlLower.includes('glb')) {
        format = 'glb'
      } else if (urlLower.includes('.gltf')) {
        format = 'gltf'
      } else if (urlLower.includes('.stl')) {
        format = 'stl'
      } else if (urlLower.includes('.obj')) {
        format = 'obj'
      } else {
        // Check magic bytes for GLB (starts with 'glTF')
        const header = new Uint8Array(modelBuffer.slice(0, 4))
        const magic = String.fromCharCode.apply(null, Array.from(header))
        if (magic === 'glTF') {
          format = 'glb'
        } else {
          format = 'glb' // Default assumption for AI-generated models
        }
      }
    }
    
    const contentType = format === 'glb' ? 'model/gltf-binary' : 
                        format === 'gltf' ? 'model/gltf+json' :
                        format === 'stl' ? 'application/sla' :
                        format === 'obj' ? 'text/plain' :
                        'application/octet-stream'

    const corsOrigin = getCorsOrigin(request)
    
    // Return the model with proper headers for Babylon.js
    return new NextResponse(modelBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="model.${format}"`,
        'Content-Length': modelBuffer.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const corsOrigin = getCorsOrigin(request)
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
