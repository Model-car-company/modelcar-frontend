import { NextRequest, NextResponse } from 'next/server'
import getStripe from '../../../lib/stripe'
import { createClient } from '../../../lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const {
      model,
      material,
      finish,
      quantity = 1,
      scale = 1,
      totalPrice,
      currency = 'USD',
    } = await req.json() as {
      model: { id: string; name: string }
      material: { id: string; name: string }
      finish: { id: string; name: string }
      quantity?: number
      scale?: number
      totalPrice: number
      currency?: string
    }

    if (!model?.id || !material?.id || !finish?.id || !totalPrice || totalPrice <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      shipping_address_collection: { allowed_countries: ['US','CA','GB','AU','DE','FR','NL','SE','IN'] },
      line_items: [
        {
          quantity,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(totalPrice * 100),
            product_data: {
              name: `${model.name} — ${material.name} / ${finish.name}`,
              metadata: {
                modelId: model.id,
                materialId: material.id,
                finishId: finish.id,
              },
            },
          },
        },
      ],
      metadata: {
        userId: user.id,
        modelId: model.id,
        materialId: material.id,
        finishId: finish.id,
        quantity: String(quantity),
        scale: String(scale),
        totalPrice: String(totalPrice),
        currency,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/garage?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/garage?payment=cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('create-shipping-checkout error', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Shipping checkout endpoint' })
}
