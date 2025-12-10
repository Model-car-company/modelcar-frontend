import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(
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

        // Get the user from the session
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

        // Check if user already liked this asset
        const { data: existingLike } = await supabaseAdmin
            .from('user_asset_likes')
            .select('id')
            .eq('asset_id', assetId)
            .eq('user_id', user.id)
            .single()

        if (existingLike) {
            // Unlike - remove the like
            const { error: deleteError } = await supabaseAdmin
                .from('user_asset_likes')
                .delete()
                .eq('asset_id', assetId)
                .eq('user_id', user.id)

            if (deleteError) {
                return NextResponse.json(
                    { error: 'Failed to unlike' },
                    { status: 500 }
                )
            }

            // Decrement hearts_count
            await supabaseAdmin.rpc('decrement_hearts', { asset_id: assetId })

            // Get updated count
            const { data: asset } = await supabaseAdmin
                .from('user_assets')
                .select('hearts_count')
                .eq('id', assetId)
                .single()

            return NextResponse.json({
                success: true,
                liked: false,
                hearts_count: asset?.hearts_count || 0
            })
        } else {
            // Like - add the like
            const { error: insertError } = await supabaseAdmin
                .from('user_asset_likes')
                .insert({
                    asset_id: assetId,
                    user_id: user.id
                })

            if (insertError) {
                return NextResponse.json(
                    { error: 'Failed to like' },
                    { status: 500 }
                )
            }

            // Increment hearts_count
            await supabaseAdmin.rpc('increment_hearts', { asset_id: assetId })

            // Get updated count
            const { data: asset } = await supabaseAdmin
                .from('user_assets')
                .select('hearts_count')
                .eq('id', assetId)
                .single()

            return NextResponse.json({
                success: true,
                liked: true,
                hearts_count: asset?.hearts_count || 0
            })
        }

    } catch (error) {
        console.error('Like error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
