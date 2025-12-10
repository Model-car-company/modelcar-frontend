import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
    request: NextRequest,
    { params }: { params: { assetId: string } }
) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        const { assetId } = params

        // Fetch the specific model
        const { data: model, error } = await supabaseAdmin
            .from('user_assets')
            .select('id, type, url, thumbnail_url, prompt, creator_name, created_at, format, user_id, hearts_count, category, is_public')
            .eq('id', assetId)
            .single()

        if (error || !model) {
            return NextResponse.json(
                { error: 'Model not found' },
                { status: 404 }
            )
        }

        // Transform to gallery format
        const galleryModel = {
            id: model.id,
            name: model.prompt || 'Untitled',
            thumbnail: model.thumbnail_url || model.url,
            url: model.url,
            creator: model.creator_name || 'Anonymous',
            creator_id: model.user_id,
            created_at: model.created_at,
            type: model.type,
            format: model.format?.toUpperCase() || (model.type === 'image' ? 'IMAGE' : 'MODEL'),
            category: model.category || 'other',
            hearts_count: model.hearts_count || 0
        }

        return NextResponse.json(galleryModel)

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
