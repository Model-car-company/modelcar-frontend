# Image → 3D Pipeline Setup Guide

## Overview
Complete pipeline: **Generate Image** → **Segment Parts** → **Generate 3D Model**

**ALL powered by ONE API: Synexa!** 🎉

## 🎯 Flow
1. User generates car image with **FLUX** (Synexa)
2. User clicks on car parts to segment with **SAM2** (Synexa)
3. User clicks "Generate 3D" with **Hunyuan3D-2** (Synexa)

## 🔑 API Keys Needed

### ✅ Already Configured:
- `SYNEXA_API_KEY` - For EVERYTHING!
  - ✅ Image generation (FLUX)
  - ✅ Segmentation (SAM2)
  - ✅ 3D generation (Hunyuan3D-2)

## 📝 Setup Steps

### 1. ✅ API Key Already Set!
Your Synexa API key is already configured in `.env`:
```bash
SYNEXA_API_KEY=bzbiYyDNzz7E3iSzTBRnjJq1l2GFLOErlPbYN8hu
```

This one key powers:
- FLUX image generation ($0.02/image)
- SAM2 segmentation ($0.01/segmentation)  
- Hunyuan3D-2 3D generation (~$0.10/model)

### 2. Create Supabase Storage Bucket
Run this SQL in Supabase dashboard (https://supabase.com/dashboard):

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;
```

### 3. Restart Dev Server
```bash
npm run dev
```

## 🎨 How to Use

### Step 1: Generate Image
1. Go to `/image` page
2. Type prompt: "Red Ferrari, studio lighting"
3. Click "Generate Image"
4. Image appears in feed (saved to Supabase)

### Step 2: Segment Parts (SAM2)
1. Click **"+ Add"** button (green) on any generated image
2. Click on car parts you want to include
3. Click **"- Remove"** button (red) to exclude areas
4. Green dots = include, Red dots = exclude

### Step 3: Generate 3D
1. Click **"Generate 3D"** button with sparkles icon
2. Wait ~30-60 seconds (Meshy processes)
3. 3D model appears in Garage
4. Download as GLB/STL

## 🔧 API Routes

- `/api/generate-image` - FLUX image generation (Synexa)
- `/api/segment` - SAM2 segmentation (Synexa)
- `/api/generate-3d` - Hunyuan3D-2 3D generation (Synexa)

## 💰 Pricing (All Synexa)

### Complete Pipeline Cost:
- **FLUX Image**: $0.02/image
- **SAM2 Segmentation**: $0.01/segmentation
- **Hunyuan3D-2 3D**: ~$0.10/model

**Total**: ~$0.13 per complete workflow (image → segment → 3D)

### Output:
- High-quality GLB files with textures
- Processing: 10-60 seconds total
- State-of-the-art quality (Hunyuan3D-2)

## 🎯 Current Status

✅ Image generation working (Synexa FLUX)
✅ Image storage (Supabase Storage)
✅ SAM2 segmentation API connected (Synexa)
✅ Hunyuan3D-2 3D generation connected (Synexa)
✅ Full UI flow implemented
✅ ONE API KEY powers entire pipeline!

## 🐛 Troubleshooting

### Images not saving to Garage?
- Check Supabase storage bucket exists
- Verify `SUPABASE_SERVICE_ROLE_KEY` in .env
- Check browser console for errors

### Segmentation not working?
- Verify `SYNEXA_API_KEY` is set
- Check that image URL is publicly accessible
- SAM2 model needs valid image URL (not base64)

### 3D generation fails?
- Verify `SYNEXA_API_KEY` is set correctly
- Check that segmented image URL is publicly accessible
- Hunyuan3D-2 needs valid image URL (not base64)

## 📚 Documentation

- Synexa API: https://docs.synexa.ai
- Meshy.ai API: https://docs.meshy.ai
- SAM2 Model: https://github.com/facebookresearch/segment-anything-2
