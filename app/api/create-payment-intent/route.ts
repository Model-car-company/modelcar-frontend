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
      fileId,
      assetId,
      creatorId,
      creatorCommission,
      platformEarnings,
    } = await req.json() as {
      model: { id: string; name: string }
      material: { id: string; name: string }
      finish: { id: string; name: string }
      quantity?: number
      scale?: number
      totalPrice: number
      currency?: string
      fileId?: string
      assetId?: string
      creatorId?: string
      creatorCommission?: number
      platformEarnings?: number
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
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: currency.toLowerCase(),
      description: `${model.name} — ${material.name} / ${finish.name}`,
      receipt_email: user.email ?? undefined,
      metadata: {
        userId: user.id,
        modelId: model.id,
        materialId: material.id,
        finishId: finish.id,
        quantity: String(quantity),
        scale: String(scale),
        totalPrice: String(totalPrice),
        currency,
        fileId: fileId || '',
        // Marketplace fields for commission tracking
        assetId: assetId || '',
        creatorId: creatorId || '',
        creatorCommission: String(creatorCommission ?? 0),
        platformEarnings: String(platformEarnings ?? 0),
      },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: intent.client_secret })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Create payment intent endpoint' })
}
