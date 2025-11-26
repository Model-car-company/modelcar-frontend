# Sketch-to-Render Setup Guide

## ✅ What Was Added

### Backend (Already Complete)
- ✅ `/api/v1/external/sketch-to-render` endpoint
- ✅ fal.ai ControlNet integration
- ✅ Drawing influence slider (0-100%)
- ✅ Style presets (automotive, V-Ray, KeyShot, Octane)
- ✅ 5 credit cost

### Frontend (Just Implemented)
- ✅ Drawing influence slider in sketch mode
- ✅ Style preset selector
- ✅ Integrated with backend `/sketch-to-render` endpoint
- ✅ Sketch upload to Supabase storage
- ✅ Credit checking (5 credits)
- ✅ Sleek UI matching your design

## 🔧 Required Setup

### 1. Create Supabase Storage Bucket

You need to create a `user-sketches` bucket in Supabase:

1. Go to your Supabase dashboard
2. Navigate to **Storage** > **New bucket**
3. Create bucket with these settings:
   - **Name**: `user-sketches`
   - **Public bucket**: ✅ YES (so we can get public URLs)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/png, image/jpeg, image/webp`

### 2. Set Storage Policy (RLS)

Apply these storage policies for `user-sketches`:

```sql
-- Allow authenticated users to upload their own sketches
CREATE POLICY "Users can upload sketches"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-sketches' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
CREATE POLICY "Anyone can view sketches"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-sketches');

-- Allow users to delete their own sketches
CREATE POLICY "Users can delete their sketches"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-sketches' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Environment Variables

Ensure your `.env.local` has:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # or your production URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Backend `.env` needs:

```bash
FAL_KEY=your-fal-api-key
```

## 🎨 How It Works (User Flow)

### Step 1: Draw Sketch
1. User clicks **"Sketch"** tab
2. Draws their car design on the large canvas
3. Uses pen/eraser tools, undo/redo, brush size, colors

### Step 2: Save Sketch
4. Clicks **"Save Sketch"** button
5. Canvas is saved as base64 data URL
6. Left panel shows saved sketch preview
7. **New controls appear**:
   - Rendering prompt textarea
   - Drawing influence slider (0-100%)
   - Render style dropdown

### Step 3: Configure Render
8. User fills in prompt: `"sports car, metallic blue, carbon fiber spoiler"`
9. Adjusts **Drawing Influence**:
   - **0%** = AI has creative freedom (ignores sketch, uses prompt only)
   - **70%** (default) = Balanced (follows sketch structure + prompt details)
   - **100%** = Strict adherence (matches sketch exactly)
10. Selects **Render Style**:
   - **Automotive Photography** - Studio lighting, showroom quality
   - **V-Ray Render** - Physically accurate, soft shadows, GI
   - **KeyShot Render** - Product viz, clean aesthetic, matte metal
   - **Octane Render** - Path tracing, volumetric, cinematic

### Step 4: Render (ControlNet Magic)
11. Clicks **"Render Sketch (5 credits)"**
12. Frontend:
    - Checks credits (needs 5)
    - Uploads sketch to Supabase `user-sketches` bucket
    - Gets public URL
13. Backend:
    - Receives sketch URL, prompt, influence, style
    - Calls fal.ai ControlNet Canny
    - Extracts edges from sketch
    - Generates photorealistic render following edges + prompt
    - Saves to GCS
    - Deducts 5 credits
14. Result appears in gallery
15. Sketch is cleared, ready for next iteration

## 🆚 Comparison to Vizcom

| Feature | Vizcom | Your App |
|---------|--------|----------|
| **Sketch canvas** | ✅ Yes | ✅ Yes (yours is bigger) |
| **Drawing tools** | ✅ Pen, eraser, colors | ✅ Pen, eraser, colors, undo/redo |
| **Drawing influence** | ✅ Slider | ✅ Slider (0-100%, labeled) |
| **Style presets** | ✅ Automotive, V-Ray, etc. | ✅ 4 presets (automotive, vray, keyshot, octane) |
| **ControlNet** | ✅ Yes | ✅ Yes (fal.ai SDXL ControlNet Canny) |
| **Image-to-3D** | ✅ Yes | ✅ Yes (Hyper3D, better than Vizcom) |
| **Cost** | 💰 Expensive subscription | 💰 5 credits per render (~$0.005) |

## 🧪 Testing Checklist

- [ ] Create `user-sketches` bucket in Supabase
- [ ] Apply storage policies
- [ ] Draw a simple car sketch (just outlines)
- [ ] Click "Save Sketch"
- [ ] Add prompt: "sports car, red paint, aggressive stance"
- [ ] Set drawing influence to 70%
- [ ] Select "Automotive Photography"
- [ ] Click "Render Sketch (5 credits)"
- [ ] Verify:
  - [ ] Sketch uploads to Supabase
  - [ ] Backend receives request
  - [ ] ControlNet generates image
  - [ ] 5 credits deducted
  - [ ] Result appears in gallery

## 🐛 Troubleshooting

### Error: "Failed to upload sketch"
- Check if `user-sketches` bucket exists
- Verify bucket is public
- Check RLS policies

### Error: "402 Insufficient credits"
- User needs 5 credits minimum
- Check credit balance in left panel
- Upgrade modal should appear

### Error: "Sketch rendering failed"
- Check backend logs for fal.ai errors
- Verify `FAL_KEY` is set in backend
- Ensure sketch URL is publicly accessible

### Image doesn't follow sketch
- Increase **Drawing Influence** slider
- Make sketch lines bolder (increase brush size)
- Use black (#000000) for better edge detection

### Image looks too similar to sketch
- Decrease **Drawing Influence** slider
- Add more descriptive prompt details
- Try different style preset

## 🎯 Next Steps (Optional Enhancements)

1. **Sketch templates** - Provide starting templates (sedan, SUV, coupe)
2. **Multi-angle renders** - Generate front, side, 3/4 views from one sketch
3. **Sketch refinement** - AI suggests improvements to sketch before rendering
4. **Animation** - Smooth transition showing sketch → render transformation
5. **Batch rendering** - Multiple styles from one sketch

## 📊 Credit Costs Summary

| Action | Credits | Provider |
|--------|---------|----------|
| Text-to-image | 3 | fal.ai nano-banana |
| **Sketch-to-render** | **5** | **fal.ai ControlNet** |
| Image-to-3D | 14 | Hyper3D |

---

**Status**: ✅ Ready to test  
**Competitive with**: Vizcom, Leonardo.ai, Playground AI  
**Unique advantage**: Integrated 3D generation (Vizcom charges extra)
