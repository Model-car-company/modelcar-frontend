import { NextRequest, NextResponse } from 'next/server'
import { CarAssembly } from '@/lib/types/car-parts'

// Mock database - replace with real DB later
const mockAssemblies: CarAssembly[] = []

// GET: Fetch assemblies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const publicOnly = searchParams.get('public') === 'true'
    
    let assemblies = [...mockAssemblies]
    
    // Filter by user
    if (userId) {
      assemblies = assemblies.filter(a => a.author === userId)
    }
    
    // Filter public only
    if (publicOnly) {
      assemblies = assemblies.filter(a => a.public)
    }
    
    return NextResponse.json({
      success: true,
      count: assemblies.length,
      assemblies,
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch assemblies' },
      { status: 500 }
    )
  }
}

// POST: Save assembly
export async function POST(request: NextRequest) {
  try {
    const assembly: CarAssembly = await request.json()
    
    // Generate ID if new
    if (!assembly.id) {
      assembly.id = `assembly-${Date.now()}`
      assembly.createdAt = new Date().toISOString()
    }
    
    assembly.updatedAt = new Date().toISOString()
    
    // Calculate totals
    const parts = Object.values(assembly.parts).filter(Boolean)
    assembly.totalPrintTime = parts.reduce((sum, part) => sum + (part.printTime || 0), 0)
    assembly.totalFilament = parts.reduce((sum, part) => sum + (part.filamentWeight || 0), 0)
    assembly.totalCost = parts.reduce((sum, part) => sum + (part.price || 0), 0)
    
    // Save to mock DB
    const existingIndex = mockAssemblies.findIndex(a => a.id === assembly.id)
    if (existingIndex >= 0) {
      mockAssemblies[existingIndex] = assembly
    } else {
      mockAssemblies.push(assembly)
    }
    
    return NextResponse.json({
      success: true,
      assembly,
      message: 'Assembly saved successfully'
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save assembly' },
      { status: 500 }
    )
  }
}

// DELETE: Delete assembly
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assembly ID required' },
        { status: 400 }
      )
    }
    
    const index = mockAssemblies.findIndex(a => a.id === id)
    if (index >= 0) {
      mockAssemblies.splice(index, 1)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Assembly deleted successfully'
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete assembly' },
      { status: 500 }
    )
  }
}
