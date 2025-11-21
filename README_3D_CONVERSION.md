# 3D Model Conversion Feature

## Overview
This feature allows users to upload images of model cars and convert them into 3D printable files (STL, OBJ, GLB) using AI-powered 3D generation.

## How It Works

### User Flow:
1. User uploads an image (JPG, PNG, WEBP - max 10MB)
2. Image is sent to AI service for 3D model generation
3. Processing takes 30-60 seconds
4. User receives downloadable files:
   - **STL** - Ready for 3D printing
   - **OBJ** - With texture support
   - **GLB** - For AR/VR viewing

## Setup Instructions

### 1. Get API Keys

Choose one of these services:

#### Option A: Meshy.ai (Recommended)
- Sign up at [Meshy.ai](https://www.meshy.ai)
- Go to [Developer Dashboard](https://www.meshy.ai/developers)
- Generate API key
- Free tier: 200 credits/month
- Paid: $20/month for 1000 credits

#### Option B: Kaedim3D (Professional)
- Sign up at [Kaedim3D](https://www.kaedim3d.com)
- Request API access
- ~$200/month for API

#### Option C: Self-Hosted (Free)
- Use PIFuHD or Stable Dreamfusion
- Requires GPU server
- See `/lib/3d-converter.ts` for implementation

### 2. Configure Environment

Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

Add your API key:
```env
NEXT_PUBLIC_MESHY_API_KEY=your_api_key_here
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

## API Documentation

### POST /api/convert-3d
Converts uploaded image to 3D model

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `image` (File)

**Response:**
```json
{
  "status": "success",
  "models": {
    "stl": "/api/download/model.stl",
    "obj": "/api/download/model.obj",
    "glb": "/api/download/model.glb"
  },
  "metadata": {
    "dimensions": { "x": 100, "y": 50, "z": 40, "unit": "mm" },
    "printTime": "3h 20min",
    "material": "12g PLA"
  }
}
```

## 3D Printing Guidelines

### Recommended Settings:
- **Layer Height:** 0.2mm for balanced quality/speed
- **Infill:** 20-30% for display models
- **Supports:** Tree supports for overhangs
- **Nozzle Temperature:** 200-210°C (PLA)
- **Bed Temperature:** 60°C
- **Print Speed:** 50mm/s

### Material Options:
- **PLA:** Best for beginners, eco-friendly
- **PETG:** More durable, weather resistant
- **ABS:** Strong but requires ventilation
- **Resin:** Highest detail (SLA printers)

## File Formats

### STL (Recommended for 3D Printing)
- Universal format supported by all slicers
- No color/texture information
- Smallest file size
- Use for: Cura, PrusaSlicer, Simplify3D

### OBJ (With Textures)
- Includes material and texture data
- Larger file size
- Use for: Editing in Blender, Maya, 3DS Max

### GLB (Web/AR)
- Compressed GLTF format
- Includes textures and materials
- Use for: Web viewers, AR apps, Unity/Unreal

## Limitations

### Current Limitations:
- Single view reconstruction (best with side/3/4 view)
- Complex interiors not captured
- Transparent parts may not convert well
- Fine details depend on image quality

### Best Practices:
1. Use high-resolution images (min 1024x1024)
2. Good lighting, minimal shadows
3. Plain background preferred
4. Multiple angles = better results
5. Avoid reflective surfaces

## Production Deployment

### 1. Cloud Storage Setup
For production, store generated models in cloud storage:

```javascript
// Example: AWS S3 Integration
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });

async function uploadModel(file: Buffer, key: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `models/${key}`,
    Body: file,
    ContentType: 'model/stl'
  }));
}
```

### 2. Rate Limiting
Implement rate limiting to prevent abuse:

```javascript
// Using next-rate-limit
import { rateLimiter } from '@/lib/rate-limit';

const limiter = rateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// In API route:
try {
  await limiter.check(res, 3, 'CACHE_TOKEN'); // 3 requests per minute
} catch {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

### 3. Queue System
For handling multiple conversions:

```javascript
// Using BullMQ or similar
import { Queue } from 'bullmq';

const conversionQueue = new Queue('3d-conversions');

// Add job to queue
await conversionQueue.add('convert', {
  imageUrl: uploadedImageUrl,
  userId: user.id,
  options: { quality: 'high' }
});
```

## Troubleshooting

### Common Issues:

**1. API Key Not Working**
- Check if key is correctly set in `.env.local`
- Verify API credits/limits
- Check CORS settings if custom domain

**2. Conversion Fails**
- Image too large (max 10MB)
- Unsupported format (use JPG/PNG)
- API service down (check status)

**3. Download Not Working**
- Check browser console for errors
- Verify CORS headers
- Check file permissions

## Cost Analysis

### Per Model Cost Estimate:
- **Meshy.ai:** ~$0.10-0.20 per conversion
- **Kaedim3D:** ~$1-2 per conversion
- **Self-hosted:** Only server costs

### Monthly Costs (100 conversions):
- **Meshy.ai:** $20 (paid tier)
- **Kaedim3D:** $200+ 
- **Self-hosted GPU:** $50-200 (cloud GPU)

## Support

For issues or questions:
1. Check this documentation
2. Review `/lib/3d-converter.ts` implementation
3. Check API service documentation
4. Open an issue on GitHub

## License

This feature is part of the Model Masters website.
API usage subject to third-party service terms.
