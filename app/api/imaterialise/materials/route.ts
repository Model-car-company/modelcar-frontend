import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/imaterialise/materials`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error: any) {
    console.error('Error fetching i.materialise materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials', details: error.message },
      { status: 500 }
    )
  }
}
