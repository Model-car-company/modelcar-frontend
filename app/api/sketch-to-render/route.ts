import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { sketchImage, prompt, drawingInfluence = 0.7 } = await req.json()

    if (!sketchImage) {
      return NextResponse.json(
        { error: 'Sketch image is required' },
        { status: 400 }
      )
    }

    if (!REPLICATE_API_KEY) {
      return NextResponse.json(
        { error: 'No API key configured. Set REPLICATE_API_KEY in .env' },
        { status: 500 }
      )
    }

    // Use ControlNet + Stable Diffusion for sketch-to-render
    // This uses Canny edge detection to follow the sketch lines
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613',
        input: {
          image: sketchImage,
          prompt: prompt || "photorealistic car render, studio lighting, high detail, 4K, professional automotive photography, metallic paint, reflective surfaces",
          negative_prompt: "low quality, blurry, distorted, ugly, bad anatomy, deformed, draft, sketch, unfinished, watermark, text, signature",
          num_outputs: 1,
          guidance_scale: 7.5,
          controlnet_conditioning_scale: drawingInfluence,
          num_inference_steps: 30,
        }
      })
    })

    if (!response.ok) {
      throw new Error('Replicate API request failed')
    }

    const prediction = await response.json()
    
    // Poll for completion
    let status = prediction.status
    let predictionData = prediction
    
    while (status !== 'succeeded' && status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_KEY}`,
          },
        }
      )
      
      predictionData = await statusResponse.json()
      status = predictionData.status
    }

    if (status === 'failed') {
      throw new Error('Image generation failed')
    }

    // Output is an array of URLs
    const imageUrl = Array.isArray(predictionData.output) 
      ? predictionData.output[0] 
      : predictionData.output

    return NextResponse.json({
      success: true,
      imageUrl,
    })

  } catch (error: any) {
    console.error('Sketch-to-render error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to render sketch' },
      { status: 500 }
    )
  }
}
