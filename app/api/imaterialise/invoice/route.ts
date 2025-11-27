import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

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
             console.error("Upload failed", await uploadResponse.text())
             throw new Error("Failed to upload model to printing service")
        }
        
        const uploadData = await uploadResponse.json()
        fileId = uploadData.file_id
    }

    if (!fileId) {
        throw new Error("No file_id or model_url provided")
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
      const errorData = await estimateResponse.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.detail || `Backend returned ${estimateResponse.status}`)
    }

    const estimateData = await estimateResponse.json()
    const estimate = estimateData.estimate
    
    // 3. Format response to match what frontend expects
    // Frontend expects: total_price, unit_price, currency, valid_until
    
    return NextResponse.json({
        success: true,
        total_price: estimate.totalPrice,
        unit_price: estimate.totalPrice / (body.quantity || 1),
        currency: estimate.currency || 'USD',
        quantity: body.quantity || 1,
        material_id: body.material_id,
        finish_id: body.finish_id,
        file_id: fileId, // Return this so frontend can use it for checkout? (Not currently stored in frontend state, but useful)
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })
    
  } catch (error: any) {
    console.error('Error getting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to get invoice', details: error.message },
      { status: 500 }
    )
  }
}
