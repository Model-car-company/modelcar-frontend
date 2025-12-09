import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    try {
        // Initialize Supabase admin client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // Get limit from query params (default 50)
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50', 10)

        // Fetch public models from all users
        const { data: models, error } = await supabaseAdmin
            .from('user_assets')
            .select('id, type, url, thumbnail_url, prompt, creator_name, created_at, format, user_id')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch gallery models' },
                { status: 500 }
            )
        }

        // Transform to gallery format
        const galleryModels = (models || []).map(model => ({
            id: model.id,
            name: model.prompt || 'Untitled',
            thumbnail: model.thumbnail_url || model.url,
            url: model.url, // Actual file URL for 3D viewing
            creator: model.creator_name || 'Anonymous',
            created_at: model.created_at,
            type: model.type,
            format: model.format?.toUpperCase() || (model.type === 'image' ? 'IMAGE' : 'MODEL')
        }))

        return NextResponse.json({
            models: galleryModels,
            count: galleryModels.length
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
