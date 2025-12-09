import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!body.shipping_address) {
      return NextResponse.json(
        { error: 'shipping_address is required' },
        { status: 400 }
      )
    }

    const items = body.items.map((item: any) => ({
      file_id: item.file_id || item.model_id || item.publicFileServiceId,
      filament_id: item.filament_id || item.material_id,
      quantity: item.quantity || 1,
      name: item.name
    }))

    const orderBody = {
      customer_email: body.email || body.customer_email || body.billing_address?.email,
      shipping_address: {
        name: body.shipping_address.name || body.shipping_address.full_name,
        line1: body.shipping_address.line1 || body.shipping_address.address_line1,
        line2: body.shipping_address.line2 || body.shipping_address.address_line2 || '',
        city: body.shipping_address.city,
        state: body.shipping_address.state || body.shipping_address.region,
        zip: body.shipping_address.zip || body.shipping_address.postal_code,
        country: body.shipping_address.country || 'US'
      },
      items,
      metadata: { source: 'tangibel' }
    }

    const draftResponse = await fetch(`${BACKEND_URL}/api/v1/printing/draft-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderBody),
    })

    if (!draftResponse.ok) {
      throw new Error('Order creation failed')
    }

    const draftData = await draftResponse.json()

    if (body.auto_process) {
      const processResponse = await fetch(`${BACKEND_URL}/api/v1/printing/process-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: draftData.order_id }),
      })

      if (!processResponse.ok) {
        throw new Error('Order processing failed')
      }

      const processData = await processResponse.json()
      return NextResponse.json({
        success: true,
        order_id: draftData.order_id,
        status: 'processing',
        order: processData.order
      })
    }

    return NextResponse.json({
      success: true,
      order_id: draftData.order_id,
      status: 'drafted',
      order: draftData.order
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
