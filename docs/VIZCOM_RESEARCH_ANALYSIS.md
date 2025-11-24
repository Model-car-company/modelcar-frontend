# Vizcom Technology Stack - Deep Research Analysis

## Executive Summary
Vizcom is an AI-powered design platform that transforms 2D sketches into photorealistic renders and 3D models. This document analyzes their technical implementation and provides a roadmap for replicating their capabilities in DREAMFORGE.

---

## 1. SKETCH-TO-RENDER TECHNOLOGY

### How Vizcom Does It

**Core Technology Stack:**
- **Base Model**: Stable Diffusion 1.5 (confirmed via Reddit community discussions)
- **Conditioning Method**: ControlNet for precise sketch-to-image control
- **Preprocessors**: Multiple edge detection methods (Canny, HED, Scribble, Lineart)
- **Custom Training**: Fine-tuned on design/product datasets for industrial design aesthetics

**Workflow Architecture:**
```
Sketch Input 
  → ControlNet Preprocessor (Canny/Scribble/Lineart)
  → Stable Diffusion 1.5 + ControlNet Conditioning
  → Prompt-guided Generation
  → Style/Palette Application (render engine aesthetic)
  → Drawing Influence Slider (sketch adherence control)
  → Photorealistic Output
```

**Key Features:**
1. **Drawing Influence Slider**: Controls how closely the output follows the sketch (0-100%)
2. **Palette System**: Pre-defined aesthetic styles (render engines like V-Ray, KeyShot, etc.)
3. **Layered Canvas**: Non-destructive editing with multiple layers
4. **Iterative Refinement**: History tracking for all generations
5. **Prompt Enhancement**: Auto-describe feature to generate prompts from images

### Technical Implementation Details

**ControlNet Conditioning Types:**
- **Canny Edge**: Hard edges, precise line detection
- **Scribble**: Loose sketches, handles messy drawings
- **Lineart**: Clean line drawings
- **HED (Holistically-Nested Edge Detection)**: Soft edges, preserves details

**Processing Pipeline:**
1. **Input Normalization**: Resize sketch to 512x512 or 768x768
2. **Edge Extraction**: Apply selected preprocessor
3. **Conditioning Encoding**: Convert edges to latent control signals
4. **Diffusion Generation**: 20-50 steps with ControlNet guidance
5. **Post-processing**: Upscaling, color correction, detail enhancement

---

## 2. IMAGE-TO-3D TECHNOLOGY

### How Vizcom Does It

**Technology Stack:**
- **Multiview Generation**: Zero123++ for consistent multi-view diffusion
- **3D Reconstruction**: LRM (Large Reconstruction Model) or InstantMesh architecture
- **Mesh Extraction**: Differentiable Marching Cubes from triplane NeRF
- **Export Formats**: GLB (textured), OBJ, STL, USDZ (AR viewing)

**Workflow Architecture:**
```
2D Render Input
  → Background Removal (automatic segmentation)
  → Zero123++ Multiview Generation (6 views: front, back, left, right, top, bottom)
  → InstantMesh/LRM Reconstruction
    → Triplane NeRF Generation
    → Density Field → Marching Cubes → Mesh Extraction
    → Texture Projection from multiviews
  → Mesh Refinement (topology optimization)
  → Export (GLB/OBJ/STL/USDZ)
```

**3D Generation Modes:**

1. **Standard 3D** (Fast, ~30 seconds)
   - Lower resolution mesh (~10K vertices)
   - Good for quick preview and iteration
   - Optimized for speed over detail

2. **Detailed Smooth** (Medium, ~2 minutes)
   - Clean topology, ~50K vertices
   - Ideal for further editing in 3D software
   - Emphasizes smooth surfaces

3. **Detailed Sharp** (Slow, ~5 minutes)
   - High-detail mesh, ~100K+ vertices
   - Preserves intricate sketch details
   - Best texture quality

4. **Multiview to 3D** (Advanced)
   - Uses 2-5 sketch layers from different angles
   - Most accurate 3D representation
   - Requires user to provide multiple views

### Technical Deep Dive

**Zero123++ Multiview Diffusion:**
- Image-conditioned diffusion model
- Generates 6 consistent views from single input
- Fine-tuned from Stable Diffusion XL
- Camera pose conditioning for view consistency
- Prevents "Janus problem" (multi-face artifacts)

**InstantMesh Architecture:**
```
Image Encoder (DINO ViT)
  ↓
Transformer (cross-attention with camera embeddings)
  ↓
Triplane NeRF Decoder (3 × 256×256 feature planes)
  ↓
Density Field + Color Field
  ↓
Differentiable Marching Cubes
  ↓
Mesh + UV Map
  ↓
Texture Baking from multiviews
```

**Mesh Quality Techniques:**
- **Geometry Refinement**: Laplacian smoothing, edge collapse
- **Texture Enhancement**: Multi-view texture blending, seamless stitching
- **Topology Optimization**: Quad meshing for better 3D software compatibility

---

## 3. HOW TO REPLICATE IN DREAMFORGE

### Phase 1: Sketch-to-Render (IMMEDIATE IMPLEMENTATION)

**Recommended Stack:**

#### Option A: Replicate API (Fastest to Deploy)
```typescript
// Use Replicate's hosted ControlNet + Stable Diffusion
API: replicate.com/controlnet
Model: lllyasviel/control_v11p_sd15_canny
       lllyasviel/control_v11p_sd15_scribble
       lllyasviel/control_v11p_sd15_lineart
```

**Implementation:**
```typescript
// app/api/sketch-to-render/route.ts
import Replicate from 'replicate';

export async function POST(req: Request) {
  const { sketchImage, prompt, controlType, drawingInfluence } = await req.json();
  
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });
  
  // Step 1: Apply ControlNet preprocessor
  const preprocessed = await replicate.run(
    "jagilley/controlnet-canny",
    { input: { image: sketchImage } }
  );
  
  // Step 2: Generate with ControlNet conditioning
  const output = await replicate.run(
    "stability-ai/sdxl",
    {
      input: {
        prompt: `photorealistic car render, ${prompt}, studio lighting, 4K`,
        image: preprocessed,
        controlnet: "canny",
        controlnet_conditioning_scale: drawingInfluence / 100, // 0.0 - 1.0
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }
    }
  );
  
  return Response.json({ imageUrl: output });
}
```

#### Option B: Local Deployment (More Control, Higher Cost)
```bash
# Run ComfyUI with ControlNet models
# Requirements: 12GB+ VRAM GPU (RTX 3060+)
docker run --gpus all -p 8188:8188 comfyui/comfyui:latest
```

**Features to Implement:**

1. **Drawing Influence Slider**
   - Maps to ControlNet conditioning scale (0.0-1.0)
   - Lower = more creative freedom
   - Higher = stricter sketch adherence

2. **Palette/Style System**
   ```typescript
   const RENDER_PALETTES = {
     vray: "V-Ray render engine, glossy materials, studio HDRI",
     keyshot: "KeyShot render, matte aluminum, soft shadows",
     octane: "Octane render, subsurface scattering, volumetric lighting",
     automotive: "automotive photography, showroom lighting, metallic paint",
   };
   ```

3. **Multi-Stage Pipeline**
   - Base generation (512x512)
   - Upscaling (img2img at 1024x1024)
   - Detail refinement (inpainting for areas needing improvement)

### Phase 2: Image-to-3D (MEDIUM-TERM)

**Recommended Stack:**

#### Option A: Cloud APIs (Easiest)
```typescript
// Primary: InstantMesh via Replicate
const mesh = await replicate.run(
  "camenduru/instantmesh",
  { input: { image: renderImage } }
);

// Alternative: Meshy.ai (what we currently use)
// Already implemented in /api/generate-3d
```

#### Option B: Self-Hosted (Best Quality)
```bash
# Deploy InstantMesh locally
git clone https://github.com/TencentARC/InstantMesh
# Requires: 24GB VRAM (RTX 3090/4090)
```

**Features to Implement:**

1. **Multiview Generation First**
   ```typescript
   // Generate 6 consistent views with Zero123++
   const multiviews = await replicate.run(
     "sudo-ai/zero123plus-v1.2",
     {
       input: {
         image: renderImage,
         views: 6, // front, back, left, right, top, bottom
       }
     }
   );
   ```

2. **3D Quality Tiers** (like Vizcom)
   ```typescript
   const MESH_QUALITY = {
     standard: { resolution: 128, time: "30s", vertices: "~10K" },
     detailed_smooth: { resolution: 256, time: "2m", vertices: "~50K" },
     detailed_sharp: { resolution: 384, time: "5m", vertices: "~100K" },
   };
   ```

3. **Mesh Post-Processing**
   ```typescript
   // Use existing mesh utilities
   import { optimizeMesh, smoothMesh } from '@/lib/meshUtils';
   
   const refined = await optimizeMesh(rawMesh, {
     targetVertices: 50000,
     smoothIterations: 3,
     preserveDetails: true,
   });
   ```

### Phase 3: Advanced Features (LONG-TERM)

1. **Custom Model Fine-Tuning**
   - Train on car-specific dataset
   - Use DreamBooth or LoRA for style consistency
   - Host custom models on Replicate

2. **Multiview Sketch Input** (like Vizcom's advanced mode)
   - Allow users to draw multiple views
   - Use all views for 3D reconstruction
   - Better control over final mesh

3. **Real-Time Preview**
   - WebGL sketch canvas
   - Live ControlNet preview (lower quality)
   - Final render on demand

---

## 4. COST & PERFORMANCE COMPARISON

### Vizcom Pricing (for reference)
- Free: 100 renders/month
- Pro: $30/month, unlimited renders
- Team: $50/user/month, custom models

### DREAMFORGE Implementation Costs

**Option A: Replicate API**
```
Sketch-to-Render:
- ControlNet preprocessing: $0.0001/image
- SD generation: $0.0023/image
- Total: ~$0.0024/render

Image-to-3D:
- Zero123++ multiview: $0.05/generation
- InstantMesh: $0.10/generation
- Total: ~$0.15/3D model

Monthly estimate (1000 users, 50 renders each):
- 50,000 renders × $0.0024 = $120
- 10,000 3D models × $0.15 = $1,500
- Total: ~$1,620/month
```

**Option B: Self-Hosted**
```
Hardware: RTX 4090 ($1,600) + Server
Monthly costs: $200-500 (cloud GPU rental)
Processing: 
- Sketch-to-render: 3-5 seconds
- Image-to-3D: 30-120 seconds
```

**Recommendation**: Start with Replicate API, migrate to self-hosted at 5,000+ users

---

## 5. IMMEDIATE ACTION PLAN

### Week 1-2: Sketch-to-Render MVP
```bash
# Install dependencies
npm install replicate

# Create API route
touch app/api/sketch-to-render/route.ts

# Create UI component
touch components/SketchToRenderPipeline.tsx
```

**Features:**
- ✅ Upload sketch or draw on canvas
- ✅ Text prompt input
- ✅ Drawing influence slider
- ✅ Style/palette selector (3-5 presets)
- ✅ Generate button + progress
- ✅ Display results with download

### Week 3-4: Integrate Image-to-3D
- ✅ Use existing `/api/generate-3d` route
- ✅ Add multiview generation option
- ✅ Implement quality tier selection
- ✅ Show 3D preview in viewer

### Week 5-6: Polish & Optimization
- ✅ Batch processing queue
- ✅ Credit system integration
- ✅ History/gallery for past renders
- ✅ Export options (PNG, GLB, STL)

---

## 6. TECHNICAL CHALLENGES & SOLUTIONS

### Challenge 1: Sketch Quality Variations
**Problem**: User sketches vary wildly in quality
**Solution**: 
- Offer sketch cleanup tool (auto-trace, line smoothing)
- Provide sketch templates/guides
- Multi-preprocessor approach (try Canny, Scribble, Lineart)

### Challenge 2: 3D Consistency
**Problem**: Single-view 3D can have artifacts (Janus problem)
**Solution**:
- Always use Zero123++ for multiview
- Offer multiview sketch input mode
- Show confidence score for 3D quality

### Challenge 3: Processing Time
**Problem**: Users expect instant results
**Solution**:
- Implement job queue system
- Show realistic time estimates
- Offer "fast preview" + "final render" modes
- Progressive rendering (show low-res first)

### Challenge 4: Cost Management
**Problem**: API costs scale with users
**Solution**:
- Credit system (already implemented)
- Cache common requests
- Tier limits (Free: 10/day, Pro: 100/day, Enterprise: unlimited)
- Batch processing during off-peak hours

---

## 7. COMPETITIVE ADVANTAGES FOR DREAMFORGE

### What We Can Do Better Than Vizcom:

1. **Car-Specific Training**
   - Fine-tune on automotive design dataset
   - Better understanding of car proportions
   - Specialized materials (paint, chrome, carbon fiber)

2. **Integrated Workflow**
   - Sketch → Render → 3D → Edit → Export in one platform
   - Part-by-part editing (already have mesh segmentation)
   - Direct integration with Studio 3D editor

3. **3D Printing Ready**
   - Auto-generate print-ready STL
   - Wall thickness analysis
   - Support structure suggestions
   - Already have this infrastructure

4. **Collaboration Features**
   - Real-time multi-user editing
   - Version control for designs
   - Team libraries

5. **Open API**
   - Let developers build on our platform
   - Custom integrations with 3D software
   - Webhook notifications

---

## 8. RECOMMENDED TECH STACK

### Sketch-to-Render
```yaml
Primary: Replicate API
Models:
  - stability-ai/sdxl (base generation)
  - lllyasviel/controlnet-v1.1 (conditioning)
Alternatives:
  - RunPod (self-hosted)
  - ComfyUI (local dev)
```

### Image-to-3D
```yaml
Primary: InstantMesh via Replicate
Backup: Meshy.ai (already integrated)
Future: TripoSR, LRM (when available)
```

### Infrastructure
```yaml
Queue: BullMQ + Redis
Storage: Supabase Storage (already using)
Database: Supabase PostgreSQL (already using)
Monitoring: PostHog (already using)
```

---

## 9. IMPLEMENTATION CODE EXAMPLES

### Sketch-to-Render Component
```typescript
// components/SketchToRenderPipeline.tsx
'use client'

import { useState } from 'react'
import { Canvas2D } from './Canvas2D' // drawing tool
import { ImageUploader } from './ImageUploader'

export default function SketchToRenderPipeline() {
  const [sketchImage, setSketchImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [drawingInfluence, setDrawingInfluence] = useState(70)
  const [palette, setPalette] = useState('automotive')
  const [controlType, setControlType] = useState('canny')
  const [rendering, setRendering] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleGenerate = async () => {
    setRendering(true)
    
    try {
      const response = await fetch('/api/sketch-to-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sketchImage,
          prompt,
          drawingInfluence,
          palette,
          controlType,
        }),
      })
      
      const data = await response.json()
      setResult(data.imageUrl)
    } catch (error) {
      console.error('Render failed:', error)
    } finally {
      setRendering(false)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left: Input */}
      <div>
        <h2>Sketch Input</h2>
        <div className="tabs">
          <button>Draw</button>
          <button>Upload</button>
        </div>
        
        {/* Drawing canvas or upload */}
        <Canvas2D onChange={setSketchImage} />
        
        {/* Controls */}
        <div className="controls">
          <label>
            Prompt
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="sports car, red paint, carbon fiber..."
            />
          </label>
          
          <label>
            Drawing Influence: {drawingInfluence}%
            <input
              type="range"
              min="0"
              max="100"
              value={drawingInfluence}
              onChange={(e) => setDrawingInfluence(Number(e.target.value))}
            />
          </label>
          
          <label>
            Style Palette
            <select value={palette} onChange={(e) => setPalette(e.target.value)}>
              <option value="automotive">Automotive Photography</option>
              <option value="vray">V-Ray Render</option>
              <option value="keyshot">KeyShot Render</option>
              <option value="octane">Octane Render</option>
            </select>
          </label>
          
          <label>
            Control Type
            <select value={controlType} onChange={(e) => setControlType(e.target.value)}>
              <option value="canny">Canny (Hard Edges)</option>
              <option value="scribble">Scribble (Loose Sketch)</option>
              <option value="lineart">Lineart (Clean Lines)</option>
            </select>
          </label>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={!sketchImage || rendering}
          className="generate-btn"
        >
          {rendering ? 'Rendering...' : 'Generate Render'}
        </button>
      </div>
      
      {/* Right: Output */}
      <div>
        <h2>Photorealistic Render</h2>
        {result ? (
          <div>
            <img src={result} alt="Rendered result" />
            <div className="actions">
              <button>Download PNG</button>
              <button>Generate 3D Model</button>
              <button>Edit in Studio</button>
            </div>
          </div>
        ) : (
          <div className="placeholder">
            Your rendered image will appear here
          </div>
        )}
      </div>
    </div>
  )
}
```

### API Route Implementation
```typescript
// app/api/sketch-to-render/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { createClient } from '@/lib/supabase/server'
import { checkCredits, deductCredits, CREDIT_COSTS } from '@/lib/credits'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY })

const PALETTE_PROMPTS = {
  automotive: 'automotive photography, showroom lighting, studio HDRI, metallic paint, reflective surfaces, professional car photo',
  vray: 'V-Ray render, physically accurate materials, global illumination, soft shadows, photorealistic lighting',
  keyshot: 'KeyShot render, matte aluminum, anodized metal, soft studio lighting, clean aesthetic',
  octane: 'Octane render, path tracing, subsurface scattering, volumetric lighting, cinematic look',
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check credits
    const hasCredits = await checkCredits(user.id, CREDIT_COSTS.SKETCH_TO_RENDER)
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }
    
    const { sketchImage, prompt, drawingInfluence, palette, controlType } = await req.json()
    
    // Step 1: Preprocess sketch with ControlNet preprocessor
    console.log('Preprocessing sketch with', controlType)
    const preprocessModel = controlType === 'canny'
      ? 'jagilley/controlnet-canny'
      : controlType === 'scribble'
      ? 'jagilley/controlnet-scribble'
      : 'jagilley/controlnet-lineart'
    
    const preprocessed = await replicate.run(preprocessModel, {
      input: { image: sketchImage }
    })
    
    // Step 2: Generate with Stable Diffusion + ControlNet
    console.log('Generating render with SDXL + ControlNet')
    const fullPrompt = `${prompt}, ${PALETTE_PROMPTS[palette]}, high quality, 4K, professional, detailed`
    const negativePrompt = 'low quality, blurry, distorted, ugly, bad anatomy, watermark, text'
    
    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: fullPrompt,
          negative_prompt: negativePrompt,
          image: preprocessed,
          control_guidance_start: 0.0,
          control_guidance_end: 1.0,
          controlnet_conditioning_scale: drawingInfluence / 100,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024,
        }
      }
    )
    
    // Step 3: Upload to Supabase Storage
    const imageUrl = Array.isArray(output) ? output[0] : output
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    const fileName = `renders/${user.id}/${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      })
    
    if (uploadError) {
      throw new Error('Failed to save render')
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(fileName)
    
    // Deduct credits
    await deductCredits(user.id, CREDIT_COSTS.SKETCH_TO_RENDER)
    
    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      creditsUsed: CREDIT_COSTS.SKETCH_TO_RENDER,
    })
    
  } catch (error: any) {
    console.error('Sketch-to-render error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate render' },
      { status: 500 }
    )
  }
}
```

---

## 10. CONCLUSION & NEXT STEPS

### Summary
Vizcom's technology is replicable using:
1. **Stable Diffusion + ControlNet** for sketch-to-render
2. **Zero123++ + InstantMesh** for image-to-3D
3. Both available via Replicate API or self-hosted

### We Already Have:
- ✅ Image generation pipeline (Replicate FLUX)
- ✅ 3D generation (Meshy.ai)
- ✅ 3D viewer and editor (Babylon.js)
- ✅ Mesh segmentation and editing
- ✅ Credit system
- ✅ Supabase storage and auth

### What We Need to Add:
- 🔲 ControlNet integration for sketch conditioning
- 🔲 Drawing canvas component
- 🔲 Style/palette system
- 🔲 Drawing influence slider
- 🔲 Multiview generation for better 3D
- 🔲 Quality tiers for 3D generation

### Estimated Timeline:
- **Week 1-2**: Sketch-to-render MVP
- **Week 3-4**: Image-to-3D integration
- **Week 5-6**: Polish and optimization
- **Total**: 6 weeks to feature parity with Vizcom

### Cost to Launch:
- Development: Already have team
- API costs: ~$200-500/month initially
- Infrastructure: Already in place (Supabase, Vercel)

**We can absolutely build this and launch within 6 weeks. Let's do it!** 🚀
