import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id
    
    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
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
    const modelResponse = await fetch(data.url)
    
    if (!modelResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch model' }, { status: 502 })
    }

    // Get the model data
    const modelBuffer = await modelResponse.arrayBuffer()
    
    // Determine content type
    const format = data.format || 'glb'
    const contentType = format === 'glb' ? 'model/gltf-binary' : 
                        format === 'gltf' ? 'model/gltf+json' :
                        format === 'stl' ? 'application/sla' :
                        format === 'obj' ? 'text/plain' :
                        'application/octet-stream'

    // Return the model with proper headers
    return new NextResponse(modelBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="model.${format}"`,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })

  } catch (error) {
    console.error('Model proxy error:', error)
    return NextResponse.json({ error: 'Failed to proxy model' }, { status: 500 })
  }
}
