import { NextRequest, NextResponse } from 'next/server';
import { listModels, deleteModel, getModelMetadata } from '@/lib/storage';

// GET: List all models
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    
    const blobs = await listModels(category);
    const models = blobs.map(blob => getModelMetadata(blob));
    
    return NextResponse.json({
      success: true,
      count: models.length,
      models,
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a model
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'Model URL required' },
        { status: 400 }
      );
    }
    
    await deleteModel(url);
    
    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully'
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}
