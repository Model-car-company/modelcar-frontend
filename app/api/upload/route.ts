import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getServerSession } from 'next-auth'
import { nanoid } from 'nanoid'

// Initialize S3 client (works with both AWS S3 and Cloudflare R2)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.AWS_ENDPOINT_URL, // For Cloudflare R2
})

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['model/stl', 'application/sla', 'application/octet-stream']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(file.type) && !['stl', 'obj', 'glb'].includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only STL, OBJ, and GLB files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (50MB max)
    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '52428800')
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileId = nanoid()
    const fileName = `models/${session.user.id}/${fileId}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3/R2
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedBy: session.user.id || '',
        uploadedAt: new Date().toISOString(),
      },
    })

    await s3Client.send(uploadCommand)

    // Generate public URL
    const bucketUrl = process.env.AWS_ENDPOINT_URL || 
                      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
    const fileUrl = `${bucketUrl}/${fileName}`

    // TODO: Save to database using Prisma
    // const model = await prisma.model.create({
    //   data: {
    //     name: file.name,
    //     stlUrl: fileUrl,
    //     fileSize: file.size,
    //     userId: session.user.id,
    //     generatedFrom: 'upload',
    //   }
    // })

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileId,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve user's uploaded models
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Fetch from database
    // const models = await prisma.model.findMany({
    //   where: { userId: session.user.id },
    //   orderBy: { createdAt: 'desc' }
    // })

    return NextResponse.json({
      models: [],
      total: 0,
    })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
