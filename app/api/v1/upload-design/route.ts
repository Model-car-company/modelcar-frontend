import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '../../../../lib/supabase/server'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB (Supabase free tier limit)

// Backend URL for thumbnail generation
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

/**
 * Validate that the file is an STL format
 * STL files start with "solid" (ASCII) or have a specific binary header
 */
function isValidSTL(buffer: ArrayBuffer): boolean {
    const bytes = new Uint8Array(buffer)

    // Check for ASCII STL (starts with "solid")
    const first5Bytes = Array.from(bytes.slice(0, 5))
    const asciiHeader = String.fromCharCode(...first5Bytes)
    if (asciiHeader.toLowerCase() === 'solid') {
        return true
    }

    // Binary STL: 80-byte header + 4-byte triangle count
    // Just check that file is at least 84 bytes (header + count)
    if (bytes.length >= 84) {
        return true
    }

    return false
}

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = createServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Parse multipart form data
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const name = formData.get('name') as string
        const description = formData.get('description') as string | null
        const category = formData.get('category') as string | null
        const creatorPrice = formData.get('creator_price') as string | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Design name is required' },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 100MB limit' },
                { status: 400 }
            )
        }

        // Validate file extension
        const fileName = file.name.toLowerCase()
        if (!fileName.endsWith('.stl')) {
            return NextResponse.json(
                { error: 'Only STL files are supported' },
                { status: 400 }
            )
        }

        // Read file and validate STL format
        const arrayBuffer = await file.arrayBuffer()
        if (!isValidSTL(arrayBuffer)) {
            return NextResponse.json(
                { error: 'Invalid STL file format' },
                { status: 400 }
            )
        }

        // Initialize Supabase admin for storage upload
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // Generate unique filename
        const timestamp = Date.now()
        const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50)
        const storagePath = `uploads/${user.id}/${timestamp}_${sanitizedName}.stl`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('models')
            .upload(storagePath, arrayBuffer, {
                contentType: 'application/sla',
                upsert: false
            })

        if (uploadError) {
            return NextResponse.json(
                { error: 'Failed to upload file. Please try again.' },
                { status: 500 }
            )
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('models')
            .getPublicUrl(storagePath)

        const modelUrl = urlData.publicUrl

        // Generate thumbnail via backend (if available)
        let thumbnailUrl: string | null = null

        if (BACKEND_URL) {
            try {
                const thumbnailResponse = await fetch(`${BACKEND_URL}/api/v1/render-thumbnail`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model_url: modelUrl })
                })

                if (thumbnailResponse.ok) {
                    const thumbnailData = await thumbnailResponse.json()
                    thumbnailUrl = thumbnailData.thumbnail_url
                }
            } catch (err) {
                // Thumbnail generation failed, continue without it
                console.warn('Thumbnail generation failed:', err)
            }
        }

        // If no thumbnail from backend, use a placeholder or the model URL itself
        if (!thumbnailUrl) {
            // Use a generic 3D model placeholder
            thumbnailUrl = '/placeholder-3d.png'
        }

        // Parse creator price
        const parsedPrice = creatorPrice ? parseFloat(creatorPrice) : null
        const validPrice = parsedPrice !== null && !isNaN(parsedPrice) && parsedPrice >= 0
            ? parsedPrice
            : null

        // Insert into user_assets
        const { data: asset, error: insertError } = await supabaseAdmin
            .from('user_assets')
            .insert({
                user_id: user.id,
                type: 'model3d',
                url: modelUrl,
                thumbnail_url: thumbnailUrl,
                format: 'stl',
                name: name.trim(),
                prompt: name.trim(), // For backwards compatibility
                description: description?.trim() || null,
                category: category || null,
                source: 'uploaded',
                creator_price: validPrice,
                is_public: false, // Start as private
                metadata: {
                    original_filename: file.name,
                    file_size: file.size,
                    uploaded_at: new Date().toISOString()
                }
            })
            .select()
            .single()

        if (insertError) {
            // Try to clean up uploaded file
            await supabaseAdmin.storage.from('models').remove([storagePath])
            return NextResponse.json(
                { error: 'Failed to save design. Please try again.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            asset: {
                id: asset.id,
                name: asset.name,
                url: asset.url,
                thumbnail_url: asset.thumbnail_url,
                creator_price: asset.creator_price,
                created_at: asset.created_at
            },
            message: 'Design uploaded successfully!'
        })

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to upload design' },
            { status: 500 }
        )
    }
}
