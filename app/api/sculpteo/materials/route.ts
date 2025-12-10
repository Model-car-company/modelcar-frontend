import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/printing/materials/sculpteo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Service unavailable')
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch Sculpteo materials' },
      { status: 500 }
    )
  }
}
