import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.model_id || !body.material_id || !body.finish_id) {
      return NextResponse.json(
        { error: 'model_id, material_id, and finish_id are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/imaterialise/checkout`, {
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
    console.error('Error generating i.materialise checkout:', error)
    return NextResponse.json(
      { error: 'Failed to generate checkout URL', details: error.message },
      { status: 500 }
    )
  }
}
