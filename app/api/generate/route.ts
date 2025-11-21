import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

/**
 * Tripo3D API Integration
 * Generates 3D models from text prompts
 * 
 * API Docs: https://platform.tripo3d.ai/docs
 */

const TRIPO_API_URL = 'https://api.tripo3d.ai/v2/openapi'
const TRIPO_API_KEY = process.env.TRIPO3D_API_KEY

interface TripoGenerateRequest {
  type: 'text_to_model'
  prompt: string
  model_version?: 'v2.0-20240919' | 'v1.4-20240625'
  face_limit?: number
  texture?: boolean
  pbr?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, quality = 'standard' } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check user credits
    // TODO: Implement credit check
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id }
    // })
    // if (user.credits < 10) {
    //   return NextResponse.json(
    //     { error: 'Insufficient credits' },
    //     { status: 402 }
    //   )
    // }

    // Prepare Tripo3D request
    const tripoRequest: TripoGenerateRequest = {
      type: 'text_to_model',
      prompt: prompt.trim(),
      model_version: quality === 'ultra' ? 'v2.0-20240919' : 'v1.4-20240625',
      face_limit: quality === 'ultra' ? 100000 : 50000,
      texture: true,
      pbr: true,
    }

    // Submit generation task
    const response = await fetch(`${TRIPO_API_URL}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
      },
      body: JSON.stringify(tripoRequest),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Tripo3D error:', error)
      return NextResponse.json(
        { error: 'Failed to start generation' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const { task_id } = data.data

    // Save to database
    // const generation = await prisma.generation.create({
    //   data: {
    //     prompt,
    //     type: 'TEXT',
    //     status: 'PROCESSING',
    //     provider: 'tripo3d',
    //     taskId: task_id,
    //     creditsUsed: 10,
    //     userId: session.user.id,
    //   }
    // })

    // Deduct credits
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { credits: { decrement: 10 } }
    // })

    return NextResponse.json({
      success: true,
      taskId: task_id,
      // generationId: generation.id,
      message: 'Generation started. Check status with task ID.',
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate model' },
      { status: 500 }
    )
  }
}

// Check generation status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Check status from Tripo3D
    const response = await fetch(`${TRIPO_API_URL}/task/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to check status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const { status, output } = data.data

    // Status: "queued" | "running" | "success" | "failed"
    
    if (status === 'success') {
      // Update database
      // await prisma.generation.update({
      //   where: { taskId },
      //   data: {
      //     status: 'COMPLETED',
      //     resultUrl: output.model,
      //   }
      // })

      return NextResponse.json({
        status: 'completed',
        modelUrl: output.model,
        renderedImage: output.rendered_image,
        pbr_model: output.pbr_model,
      })
    }

    if (status === 'failed') {
      // Update database
      // await prisma.generation.update({
      //   where: { taskId },
      //   data: {
      //     status: 'FAILED',
      //     errorMessage: data.data.error || 'Generation failed'
      //   }
      // })

      return NextResponse.json({
        status: 'failed',
        error: data.data.error || 'Generation failed'
      })
    }

    return NextResponse.json({
      status: status, // "queued" or "running"
      progress: data.data.progress || 0,
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
