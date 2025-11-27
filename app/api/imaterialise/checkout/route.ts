import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const orderBody = {
      customer_email: body.email || body.customer_email,
      shipping_address: body.shipping_address || {
        name: body.name || 'Customer',
        line1: body.address_line1 || body.line1 || '',
        line2: body.address_line2 || body.line2 || '',
        city: body.city || '',
        state: body.state || '',
        zip: body.zip || body.postal_code || '',
        country: body.country || 'US'
      },
      items: body.items || [{
        file_id: body.file_id || body.model_id,
        filament_id: body.filament_id || body.material_id,
        quantity: body.quantity || 1
      }],
      metadata: { source: 'tangibel' }
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/printing/draft-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.detail || errorData.error || `Backend returned ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      order_id: data.order_id,
      order: data.order
    })
    
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}
