import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!body.shipping_address || !body.billing_address) {
      return NextResponse.json(
        { error: 'shipping_address and billing_address are required' },
        { status: 400 }
      )
    }

    if (!body.shipment_service) {
      return NextResponse.json(
        { error: 'shipment_service is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/imaterialise/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error: any) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout', details: error.message },
      { status: 500 }
    )
  }
}
