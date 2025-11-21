import { put, list, del } from '@vercel/blob';

// Upload 3D model file to Vercel Blob Storage
export async function uploadModel(file: File, category: string = 'public') {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `models/${category}/${timestamp}-${sanitizedName}`;
  
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  });
  
  return {
    url: blob.url,
    filename: blob.pathname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

// Upload thumbnail image
export async function uploadThumbnail(file: File, modelId: string) {
  const filename = `thumbnails/${modelId}.jpg`;
  
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  });
  
  return {
    url: blob.url,
    filename: blob.pathname,
  };
}

// List all models in storage
export async function listModels(category?: string) {
  const { blobs } = await list({
    prefix: category ? `models/${category}/` : 'models/',
  });
  
  return blobs;
}

// Delete model from storage
export async function deleteModel(url: string) {
  await del(url);
  return { success: true };
}

// Get model metadata
export function getModelMetadata(blob: any) {
  const extension = blob.pathname.split('.').pop()?.toLowerCase();
  const category = blob.pathname.split('/')[1];
  
  return {
    id: blob.pathname,
    url: blob.url,
    filename: blob.pathname.split('/').pop(),
    format: extension,
    category,
    size: blob.size,
    uploadedAt: blob.uploadedAt,
  };
}
