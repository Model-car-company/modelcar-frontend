import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(
    request: NextRequest,
    { params }: { params: { assetId: string } }
) {
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

        // Get the user from the session using server client
        const cookieStore = cookies()
        const supabaseClient = createServerClient(
            supabaseUrl,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set() { },
                    remove() { },
                },
            }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { assetId } = params
        const body = await request.json()
        const { is_public } = body

        if (typeof is_public !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid request: is_public must be a boolean' },
                { status: 400 }
            )
        }

        // Verify the asset belongs to the user
        const { data: asset, error: assetError } = await supabaseAdmin
            .from('user_assets')
            .select('user_id, id')
            .eq('id', assetId)
            .single()

        if (assetError || !asset) {
            return NextResponse.json(
                { error: 'Asset not found' },
                { status: 404 }
            )
        }

        if (asset.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden: You do not own this asset' },
                { status: 403 }
            )
        }

        // Get user's profile for creator name
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

        const creator_name = profile?.full_name || user.email?.split('@')[0] || 'Anonymous'

        // Update the asset
        const { data: updatedAsset, error: updateError } = await supabaseAdmin
            .from('user_assets')
            .update({
                is_public,
                creator_name,
                updated_at: new Date().toISOString()
            })
            .eq('id', assetId)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to update asset' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            asset: updatedAsset
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
