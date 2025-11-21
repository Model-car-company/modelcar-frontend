# 🚀 Model Car Backend - Self-Hosted AI Setup

## Repository: `model-car-api`

Separate backend for AI model inference on your GPU server.

---

## 📁 Recommended Structure

```
model-car-api/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI entry point
│   ├── models/
│   │   ├── __init__.py
│   │   ├── triposr.py          # TripoSR wrapper
│   │   └── mesh_repair.py      # Mesh fixing
│   ├── api/
│   │   ├── __init__.py
│   │   ├── generate.py         # Text-to-3D endpoint
│   │   ├── repair.py           # Mesh repair endpoint
│   │   └── upload.py           # File upload
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Settings
│   │   └── auth.py             # API key validation
│   └── utils/
│       ├── __init__.py
│       ├── storage.py          # S3/R2 upload
│       └── queue.py            # Job queue
├── models/                      # Model weights directory
│   └── triposr-cars-v1/
├── tests/
│   ├── test_generate.py
│   └── test_api.py
├── scripts/
│   ├── download_models.py
│   ├── finetune.py
│   └── benchmark.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🐍 **Core Files**

### 1. `requirements.txt`

```txt
# Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pydantic==2.5.0
pydantic-settings==2.1.0

# AI/ML
torch==2.1.0
torchvision==0.16.0
diffusers==0.24.0
transformers==4.36.0
accelerate==0.25.0

# 3D Processing
trimesh==4.0.8
pymeshlab==2023.12
numpy==1.24.3
pillow==10.1.0

# Storage
boto3==1.34.0
python-dotenv==1.0.0

# Utilities
redis==5.0.1
celery==5.3.4
```

### 2. `app/main.py` - FastAPI Server

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from app.models.triposr import TripoSRModel
from app.core.config import settings
import uvicorn

app = FastAPI(title="Model Car API", version="1.0.0")

# CORS for your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    print("Loading TripoSR model...")
    model = TripoSRModel(
        model_path="./models/triposr-cars-v1",
        device="cuda" if torch.cuda.is_available() else "cpu"
    )
    print("Model loaded successfully!")

class GenerateRequest(BaseModel):
    prompt: str
    steps: int = 50
    guidance_scale: float = 7.5
    quality: str = "standard"  # standard | high

@app.get("/")
def root():
    return {
        "name": "Model Car API",
        "version": "1.0.0",
        "status": "running",
        "gpu_available": torch.cuda.is_available()
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "gpu_memory": torch.cuda.memory_allocated() if torch.cuda.is_available() else 0
    }

@app.post("/api/generate")
async def generate_3d(request: GenerateRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Generate 3D model
        result = await model.generate(
            prompt=request.prompt,
            steps=request.steps,
            guidance_scale=request.guidance_scale
        )
        
        return {
            "success": True,
            "model_url": result["stl_url"],
            "thumbnail_url": result["thumbnail_url"],
            "generation_time": result["time"],
            "vertices": result["vertices"],
            "faces": result["faces"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/repair")
async def repair_mesh(file: UploadFile):
    # Mesh repair endpoint
    pass

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

### 3. `app/models/triposr.py` - Model Wrapper

```python
import torch
from diffusers import TripoSRPipeline
import trimesh
import time
from pathlib import Path

class TripoSRModel:
    def __init__(self, model_path: str, device: str = "cuda"):
        self.device = device
        self.pipeline = TripoSRPipeline.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32
        ).to(device)
        
    async def generate(
        self,
        prompt: str,
        steps: int = 50,
        guidance_scale: float = 7.5
    ):
        start_time = time.time()
        
        # Generate 3D mesh
        with torch.no_grad():
            output = self.pipeline(
                prompt=prompt,
                num_inference_steps=steps,
                guidance_scale=guidance_scale
            )
        
        # Convert to trimesh
        mesh = trimesh.Trimesh(
            vertices=output.vertices.cpu().numpy(),
            faces=output.faces.cpu().numpy()
        )
        
        # Save as STL
        output_path = f"./outputs/{int(time.time())}.stl"
        mesh.export(output_path)
        
        # Upload to S3/R2 (implement in storage.py)
        from app.utils.storage import upload_to_storage
        stl_url = await upload_to_storage(output_path)
        
        generation_time = time.time() - start_time
        
        return {
            "stl_url": stl_url,
            "thumbnail_url": None,  # TODO: Generate thumbnail
            "time": generation_time,
            "vertices": len(mesh.vertices),
            "faces": len(mesh.faces)
        }
```

### 4. `app/core/config.py` - Settings

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API
    API_KEY: str
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # Model
    MODEL_PATH: str = "./models/triposr-cars-v1"
    DEVICE: str = "cuda"
    MAX_QUEUE_SIZE: int = 10
    
    # Storage
    S3_BUCKET: str
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_ENDPOINT: Optional[str] = None
    
    # Redis (for queue)
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 5. `.env.example`

```env
# API Configuration
API_KEY=your-secret-api-key

# Model Settings
MODEL_PATH=./models/triposr-cars-v1
DEVICE=cuda
MAX_QUEUE_SIZE=10

# Storage (S3/R2)
S3_BUCKET=model-car-storage
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com

# Redis (for queue)
REDIS_URL=redis://localhost:6379

# Allowed Origins
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

### 6. `Dockerfile`

```dockerfile
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Download models
RUN python scripts/download_models.py

# Expose port
EXPOSE 8000

# Run server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 7. `docker-compose.yml`

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEVICE=cuda
    volumes:
      - ./models:/app/models
      - ./outputs:/app/outputs
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## 🚀 **Setup Instructions**

### 1. Create New Repository

```bash
# Create new repo
mkdir model-car-api
cd model-car-api
git init

# Copy structure from above
# Add all files
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 3. Download Models

```bash
# Download TripoSR base model
python scripts/download_models.py
```

### 4. Run Server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
docker-compose up -d
```

### 5. Test API

```bash
# Health check
curl http://localhost:8000/health

# Generate model
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "red Ferrari sports car", "steps": 50}'
```

---

## 🔗 **Connect to Frontend**

Update your Next.js `/api/generate/route.ts`:

```typescript
// app/api/generate/route.ts
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const { prompt, quality } = await request.json()
  
  // Call your backend instead of Tripo3D
  const response = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
    },
    body: JSON.stringify({ prompt, quality })
  })
  
  const data = await response.json()
  return NextResponse.json(data)
}
```

---

## 📊 **Deployment Options**

### Option 1: Your GPU Server
```bash
# SSH into your server
ssh user@your-gpu-server

# Clone backend repo
git clone https://github.com/your-username/model-car-api
cd model-car-api

# Run with Docker
docker-compose up -d
```

### Option 2: RunPod
```bash
# Use RunPod template with GPU
# Deploy Docker image
# Get public endpoint URL
```

### Option 3: Modal Labs (Serverless)
```python
# Serverless GPU inference
# Pay per second of GPU usage
# Auto-scaling
```

---

## 🎯 **Next Steps**

1. Create `model-car-api` repository
2. Copy files from this guide
3. Set up on your GPU server
4. Update frontend to point to backend
5. Deploy both separately

**Want me to generate all the backend files as a downloadable zip? Or help you set it up on your GPU?** 🚀
