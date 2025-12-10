import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

        // Fetch creator's sales data
        const { data: purchases, error: purchasesError } = await supabaseAdmin
            .from('marketplace_purchases')
            .select('*')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false })

        if (purchasesError) {
            console.error('Error fetching purchases:', purchasesError)
            return NextResponse.json(
                { error: 'Failed to fetch analytics' },
                { status: 500 }
            )
        }

        // Calculate totals
        const totalSales = purchases?.length || 0
        const totalEarnings = purchases?.reduce((sum, p) => sum + (parseFloat(p.creator_earnings) || 0), 0) || 0
        const totalRevenue = purchases?.reduce((sum, p) => sum + (parseFloat(p.total_price) || 0), 0) || 0

        // Get recent purchases (last 5)
        const recentPurchases = purchases?.slice(0, 5).map(p => ({
            id: p.id,
            asset_id: p.asset_id,
            purchase_type: p.purchase_type,
            total_price: p.total_price,
            creator_earnings: p.creator_earnings,
            created_at: p.created_at
        })) || []

        // Group purchases by month for chart
        const purchasesByMonth: { [key: string]: number } = {}
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        // Initialize last 12 months with 0
        const chartData: { date: string; sales: number }[] = []
        const now = new Date()
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthKey = `${monthNames[date.getMonth()]}`
            chartData.push({ date: monthKey, sales: 0 })
        }

        // Count purchases per month
        purchases?.forEach(purchase => {
            const date = new Date(purchase.created_at)
            const monthKey = monthNames[date.getMonth()]

            // Find and increment the count for this month
            const monthData = chartData.find(d => d.date === monthKey)
            if (monthData) {
                monthData.sales++
            }
        })

        return NextResponse.json({
            success: true,
            analytics: {
                total_sales: totalSales,
                total_earnings: totalEarnings.toFixed(2),
                total_revenue: totalRevenue.toFixed(2),
                recent_purchases: recentPurchases,
                purchases_by_month: chartData
            }
        })

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
