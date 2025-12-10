import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '../../../../lib/supabase/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.finish_id) {
      return NextResponse.json(
        { error: 'finish_id (filament) is required' },
        { status: 400 }
      )
    }

    // 1. Upload file to Slant3D if we have a URL
    // We need a file_id for estimation
    let fileId = body.file_id // If we already had it (future optimization)

    if (!fileId && body.model_url) {
      const uploadResponse = await fetch(`${BACKEND_URL}/api/v1/printing/upload-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: body.model_url,
          file_name: `model-${body.model_id}.glb`,
          owner_id: 'tangibel-user' // We could use auth user ID here
        })
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null)

        // Check for specific error codes
        if (errorData?.detail?.error_code === "HIGH_DEMAND") {
          throw new Error("HIGH_DEMAND:Our printers are in high demand right now. Please try again later.")
        } else if (errorData?.detail?.error_code === "FILE_TOO_LARGE") {
          throw new Error("FILE_TOO_LARGE:This model is too large for printing. Please try a smaller design.")
        } else {
          throw new Error("UPLOAD_FAILED:Unable to process your model right now. Please try again later.")
        }
      }

      const uploadData = await uploadResponse.json()
      fileId = uploadData.file_id
    }

    if (!fileId) {
      throw new Error("MISSING_FILE:Please provide a model to print.")
    }

    // 2. Get estimate
    const estimateResponse = await fetch(`${BACKEND_URL}/api/v1/printing/estimate-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: fileId,
        filament_id: body.finish_id, // This is the actual filament UUID
        quantity: body.quantity || 1,
        support_enabled: false
      }),
    })

    if (!estimateResponse.ok) {
      throw new Error("ESTIMATE_FAILED:Unable to calculate price. Please try again.")
    }

    const estimateData = await estimateResponse.json()
    const estimate = estimateData.estimate

    // 3. Calculate Pricing & Commission
    const FLAT_SHIPPING = 5.99
    const printingPrice = estimate.totalPrice

    // Check if buyer is the creator
    let creatorCommission = 0
    let isOwnModel = false

    // Initialize Supabase admin to fetch model details
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey && body.model_id) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

      // Get model creator
      const { data: modelData } = await supabaseAdmin
        .from('user_assets')
        .select('user_id')
        .eq('id', body.model_id)
        .single()

      if (modelData) {
        // Get current user (buyer)
        const supabase = createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          if (user.id === modelData.user_id) {
            isOwnModel = true
          } else {
            // Buyer is NOT creator -> Apply 30% commission
            creatorCommission = printingPrice * 0.30
          }
        }
      }
    }

    const totalWithShipping = Math.round((printingPrice + creatorCommission + FLAT_SHIPPING) * 100) / 100

    return NextResponse.json({
      success: true,
      printing_price: printingPrice,
      shipping_price: FLAT_SHIPPING,
      total_price: totalWithShipping,
      creator_commission: Math.round(creatorCommission * 100) / 100,
      is_own_model: isOwnModel,
      unit_price: printingPrice / (body.quantity || 1),
      currency: estimate.currency || 'USD',
      quantity: body.quantity || 1,
      material_id: body.material_id,
      finish_id: body.finish_id,
      file_id: fileId,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })

  } catch (error: any) {

    // Parse error code from message (format: "ERROR_CODE:message")
    const errorMessage = error.message || ''
    const [errorCode, friendlyMessage] = errorMessage.includes(':')
      ? errorMessage.split(':')
      : ['UNKNOWN', errorMessage]

    return NextResponse.json(
      {
        error: 'Failed to get invoice',
        error_code: errorCode,
        friendly_message: friendlyMessage || 'Something went wrong. Please try again later.'
      },
      { status: errorCode === 'HIGH_DEMAND' ? 503 : 500 }
    )
  }
}
