import { NextRequest, NextResponse } from 'next/server'
import { CarPart } from '@/lib/types/car-parts'

export const dynamic = 'force-dynamic'

// Mock part library - replace with database later
const mockParts: Record<string, CarPart[]> = {
  wheels: [
    {
      id: 'wheel-bbs-sport',
      name: 'BBS Racing Rims',
      category: 'wheels',
      meshUrl: '/models/wheels/bbs-racing.glb',
      thumbnailUrl: '/images/wheels/bbs-racing.jpg',
      description: 'High-performance BBS-style racing wheels with detailed spoke design',
      mountingPoints: [
        {
          id: 'hub-1',
          position: [0, 0, 0],
          normal: [0, 0, 1],
          type: 'wheel-hub',
          diameter: 5,
        }
      ],
      dimensions: { width: 8, height: 18, depth: 8 },
      scale: 1,
      printable: true,
      supportRequired: false,
      printTime: 180,
      filamentWeight: 45,
      price: 4.99,
      rating: 4.8,
      downloads: 1240,
      tags: ['sport', 'racing', 'bbs'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'wheel-chrome-classic',
      name: 'Chrome Classic Wheels',
      category: 'wheels',
      meshUrl: '/models/wheels/chrome-classic.glb',
      thumbnailUrl: '/images/wheels/chrome-classic.jpg',
      description: 'Vintage chrome wheels perfect for classic builds',
      mountingPoints: [
        {
          id: 'hub-1',
          position: [0, 0, 0],
          normal: [0, 0, 1],
          type: 'wheel-hub',
          diameter: 5,
        }
      ],
      dimensions: { width: 7, height: 16, depth: 7 },
      scale: 1,
      printable: true,
      printTime: 150,
      filamentWeight: 38,
      price: 3.99,
      rating: 4.6,
      downloads: 890,
      tags: ['classic', 'chrome', 'vintage'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  body: [
    {
      id: 'body-sports-coupe',
      name: 'Sports Coupe Body',
      category: 'body',
      meshUrl: '/models/body/sports-coupe.glb',
      thumbnailUrl: '/images/body/sports-coupe.jpg',
      description: 'Aerodynamic sports car body with aggressive styling',
      mountingPoints: [
        {
          id: 'wheel-mount-fl',
          position: [1.2, 0.3, 1.5],
          normal: [-1, 0, 0],
          type: 'wheel-hub',
        },
        {
          id: 'wheel-mount-fr',
          position: [-1.2, 0.3, 1.5],
          normal: [1, 0, 0],
          type: 'wheel-hub',
        },
        {
          id: 'wheel-mount-rl',
          position: [1.2, 0.3, -1.5],
          normal: [-1, 0, 0],
          type: 'wheel-hub',
        },
        {
          id: 'wheel-mount-rr',
          position: [-1.2, 0.3, -1.5],
          normal: [1, 0, 0],
          type: 'wheel-hub',
        },
        {
          id: 'engine-mount',
          position: [0, 0.5, 0.8],
          normal: [0, 1, 0],
          type: 'engine-mount',
        },
      ],
      dimensions: { width: 80, height: 40, depth: 180 },
      scale: 1,
      printable: true,
      supportRequired: true,
      printTime: 720,
      filamentWeight: 350,
      price: 14.99,
      rating: 4.9,
      downloads: 2341,
      tags: ['sports', 'coupe', 'aerodynamic'],
      mountsTo: ['wheels', 'engine', 'interior'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  interior: [
    {
      id: 'interior-racing-seats',
      name: 'Racing Bucket Seats',
      category: 'interior',
      meshUrl: '/models/interior/racing-seats.glb',
      thumbnailUrl: '/images/interior/racing-seats.jpg',
      description: 'Sport racing bucket seats with harness mounts',
      mountingPoints: [
        {
          id: 'seat-mount-1',
          position: [0, 0, 0],
          normal: [0, -1, 0],
          type: 'seat-mount',
        }
      ],
      dimensions: { width: 50, height: 80, depth: 60 },
      scale: 1,
      printable: true,
      printTime: 300,
      filamentWeight: 120,
      price: 6.99,
      rating: 4.7,
      downloads: 567,
      tags: ['racing', 'sports', 'interior'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  engine: [
    {
      id: 'engine-v8-detailed',
      name: 'V8 Engine Block',
      category: 'engine',
      meshUrl: '/models/engine/v8-detailed.glb',
      thumbnailUrl: '/images/engine/v8-detailed.jpg',
      description: 'Highly detailed V8 engine with moving pistons',
      mountingPoints: [
        {
          id: 'engine-mount-base',
          position: [0, -0.2, 0],
          normal: [0, -1, 0],
          type: 'engine-mount',
        }
      ],
      dimensions: { width: 40, height: 35, depth: 50 },
      scale: 1,
      printable: true,
      supportRequired: true,
      printTime: 480,
      filamentWeight: 180,
      price: 9.99,
      rating: 4.9,
      downloads: 1823,
      tags: ['v8', 'engine', 'detailed'],
      articulation: {
        type: 'slider',
        axis: [0, 1, 0],
        limits: [-0.5, 0.5],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    let parts: CarPart[] = []
    
    if (category && mockParts[category]) {
      parts = mockParts[category]
    } else {
      // Return all parts
      parts = Object.values(mockParts).flat()
    }
    
    // Filter by search
    if (search) {
      parts = parts.filter(part =>
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        part.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    return NextResponse.json({
      success: true,
      count: parts.length,
      parts,
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch parts' },
      { status: 500 }
    )
  }
}
