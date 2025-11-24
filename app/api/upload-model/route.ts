import { NextRequest, NextResponse } from 'next/server';
import { uploadModel } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('model') as File;
    const category = formData.get('category') as string || 'public';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const validExtensions = ['.glb', '.gltf', '.stl', '.obj', '.fbx', '.usdz'];
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: GLB, STL, OBJ, FBX, USDZ' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 50MB' },
        { status: 400 }
      );
    }
    
    // Upload to Vercel Blob
    const result = await uploadModel(file, category);
    
    return NextResponse.json({
      success: true,
      model: result,
      message: 'Model uploaded successfully'
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Get upload status
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Model upload endpoint is active',
    supportedFormats: ['GLB', 'STL', 'OBJ', 'FBX', 'USDZ'],
    maxSize: '50MB'
  });
}
