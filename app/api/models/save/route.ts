import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Create admin client for storage operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const assetId = formData.get('assetId') as string

    if (!file || !assetId) {
      return NextResponse.json(
        { error: 'Missing file or assetId' },
        { status: 400 }
      )
    }

    // Get the original asset to verify ownership and get the path
    const { data: asset, error: assetError } = await supabaseAdmin
      .from('user_assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (assetError || !asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate a new filename with timestamp to ensure cache bust
    const timestamp = Date.now()
    const fileName = `${asset.user_id}/models/${assetId}_edited_${timestamp}.glb`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(fileName, buffer, {
        contentType: 'model/gltf-binary',
        upsert: true
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload model' },
        { status: 500 }
      )
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('assets')
      .getPublicUrl(fileName)

    // Update the asset record with the new URL
    const { error: updateError } = await supabaseAdmin
      .from('user_assets')
      .update({ 
        url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update asset record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
