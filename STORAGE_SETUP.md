# 🗄️ Storage Setup Guide

Your 3D model storage system is now configured! Here's how to use it:

---

## ✅ What's Been Set Up

### **Files Created:**
- ✅ `/lib/storage.ts` - Vercel Blob helper functions
- ✅ `/app/api/upload-model/route.ts` - Upload endpoint
- ✅ `/app/api/models/route.ts` - List/delete models
- ✅ `/app/admin/models/page.tsx` - Admin UI for managing models
- ✅ `@vercel/blob` package installed

---

## 🚀 Quick Start

### **Step 1: Get Vercel Blob Token**

1. Go to: https://vercel.com/dashboard/stores
2. Click "Create Database" → Select "Blob"
3. Copy your `BLOB_READ_WRITE_TOKEN`

### **Step 2: Set Environment Variable**

Create `.env.local` file:

```bash
# Copy example
cp .env.local.example .env.local

# Add your token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

### **Step 3: Test Upload**

```bash
# Start dev server
npm run dev

# Visit admin panel
http://localhost:3000/admin/models
```

---

## 📁 API Endpoints

### **Upload Model**
```bash
POST /api/upload-model

# Example with curl:
curl -X POST http://localhost:3000/api/upload-model \
  -F "model=@/path/to/car.glb" \
  -F "category=free"
```

### **List Models**
```bash
GET /api/models
GET /api/models?category=free

# Response:
{
  "success": true,
  "count": 5,
  "models": [
    {
      "id": "models/free/1732175400000-car.glb",
      "url": "https://blob.vercel-storage.com/...",
      "filename": "car.glb",
      "format": "glb",
      "category": "free",
      "size": 2456789,
      "uploadedAt": "2024-11-21T07:30:00.000Z"
    }
  ]
}
```

### **Delete Model**
```bash
DELETE /api/models?url=https://blob.vercel-storage.com/...

# Response:
{
  "success": true,
  "message": "Model deleted successfully"
}
```

---

## 🎨 Admin Panel

**URL:** http://localhost:3000/admin/models

**Features:**
- 📤 Drag & drop upload
- 📊 View all models with stats
- 👁️ Preview models
- ⬇️ Download models
- 🗑️ Delete models
- 📈 Total size & count

---

## 💻 Using in Your Code

### **Upload from Frontend:**

```typescript
// components/ModelUploader.tsx
async function uploadModel(file: File) {
  const formData = new FormData()
  formData.append('model', file)
  formData.append('category', 'premium')
  
  const response = await fetch('/api/upload-model', {
    method: 'POST',
    body: formData,
  })
  
  const data = await response.json()
  console.log('Uploaded:', data.model.url)
}
```

### **Fetch Models:**

```typescript
// Fetch all models
const response = await fetch('/api/models')
const { models } = await response.json()

// Fetch by category
const response = await fetch('/api/models?category=free')
const { models } = await response.json()
```

### **Use in 3D Viewer:**

```typescript
import Studio3DViewer from '@/components/Studio3DViewer'

<Studio3DViewer 
  modelUrl="https://blob.vercel-storage.com/models/free/car.glb"
  showGrid={true}
/>
```

---

## 📦 File Organization

Vercel Blob automatically organizes files:

```
Vercel Blob Storage:
├── models/
│   ├── free/
│   │   ├── 1732175400000-porsche-911.glb
│   │   ├── 1732175401000-lambo.stl
│   │   └── 1732175402000-ferrari.obj
│   ├── premium/
│   │   └── 1732175403000-exclusive-car.glb
│   └── generated/
│       └── 1732175404000-ai-generated.glb
└── thumbnails/
    ├── car-001.jpg
    └── car-002.jpg
```

---

## 🔒 Security

### **File Validation:**
- ✅ Only allows: `.glb`, `.gltf`, `.stl`, `.obj`, `.fbx`, `.usdz`
- ✅ Max size: 50MB
- ✅ Sanitized filenames

### **Environment Variables:**
```bash
# Never commit to git!
.env.local

# Token format:
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

---

## 🎯 Common Use Cases

### **1. Upload Free Model:**
```bash
curl -X POST http://localhost:3000/api/upload-model \
  -F "model=@free-car.glb" \
  -F "category=free"
```

### **2. Upload Premium Model:**
```bash
curl -X POST http://localhost:3000/api/upload-model \
  -F "model=@premium-car.glb" \
  -F "category=premium"
```

### **3. Fetch All Free Models:**
```javascript
const response = await fetch('/api/models?category=free')
const { models } = await response.json()
```

### **4. Delete Model:**
```javascript
const modelUrl = 'https://blob.vercel-storage.com/...'
await fetch(`/api/models?url=${encodeURIComponent(modelUrl)}`, {
  method: 'DELETE'
})
```

---

## 🚀 Deployment

### **On Vercel:**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add model storage"
git push
```

2. **Vercel automatically:**
   - Creates Blob storage
   - Sets environment variables
   - Deploys all API routes

3. **Access admin panel:**
```
https://your-app.vercel.app/admin/models
```

---

## 📊 Pricing

### **Vercel Blob:**
- **Free Tier:** 1GB storage
- **Pro:** $0.15/GB/month
- **No egress fees** within Vercel

### **Typical Usage:**
- Average car model: 5-20MB
- 1GB = ~50-200 models
- Pro plan recommended for production

---

## 🐛 Troubleshooting

### **"Failed to upload"**
- Check `BLOB_READ_WRITE_TOKEN` is set
- Verify token from Vercel dashboard
- Ensure file is under 50MB

### **"Models not appearing"**
- Check Vercel Blob dashboard
- Verify API route is working: `/api/models`
- Clear browser cache

### **"Permission denied"**
- Token needs `read-write` permissions
- Regenerate token if needed

---

## 📚 Next Steps

1. ✅ **Set up Vercel Blob** (5 min)
2. ✅ **Test upload via admin panel**
3. ✅ **Upload 5-10 test models**
4. 🔄 **Connect to 3D Studio viewer**
5. 🔄 **Add model metadata database** (optional)

---

**Ready to upload your first model?**

Visit: http://localhost:3000/admin/models

🚗 Happy modeling!
