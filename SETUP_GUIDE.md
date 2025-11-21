# 🚀 Complete Backend Setup Guide

## Overview
This guide will help you set up the complete production backend with:
- PostgreSQL database
- Prisma ORM
- AWS S3/Cloudflare R2 storage
- Tripo3D AI integration
- Authentication
- File uploads
- AI model generation

---

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS account OR Cloudflare account
- Tripo3D API key

---

## 🔧 Step 1: Install Dependencies

```bash
npm install @prisma/client prisma
npm install @aws-sdk/client-s3
npm install next-auth
npm install nanoid
npm install zod # For validation
```

### Dev Dependencies
```bash
npm install -D @types/node
```

---

## 🗄️ Step 2: Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL:
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu
sudo apt install postgresql-14
sudo systemctl start postgresql
```

2. Create database:
```bash
psql postgres
CREATE DATABASE modelcar_db;
CREATE USER modelcar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE modelcar_db TO modelcar_user;
\q
```

3. Update `.env`:
```env
DATABASE_URL="postgresql://modelcar_user:your_password@localhost:5432/modelcar_db"
```

### Option B: Supabase (Recommended for production)

1. Go to https://supabase.com
2. Create new project
3. Copy connection string
4. Update `.env`:
```env
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

---

## 📦 Step 3: Prisma Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Open Prisma Studio (visual database editor)
npx prisma studio
```

---

## ☁️ Step 4: Storage Setup

### Option A: AWS S3

1. Create S3 bucket at https://console.aws.amazon.com/s3
2. Create IAM user with S3 access
3. Get Access Key ID and Secret
4. Update `.env`:
```env
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="your-bucket-name"
```

### Option B: Cloudflare R2 (Recommended - cheaper)

1. Go to Cloudflare dashboard → R2
2. Create bucket
3. Create R2 API token
4. Update `.env`:
```env
AWS_ACCESS_KEY_ID="your-r2-access-key"
AWS_SECRET_ACCESS_KEY="your-r2-secret-key"
AWS_REGION="auto"
AWS_BUCKET_NAME="your-bucket-name"
AWS_ENDPOINT_URL="https://[account-id].r2.cloudflarestorage.com"
```

**Note:** R2 is S3-compatible, so same code works!

---

## 🤖 Step 5: Tripo3D API Setup

1. Go to https://platform.tripo3d.ai
2. Sign up for account
3. Get API key from dashboard
4. Update `.env`:
```env
TRIPO3D_API_KEY="your-tripo-api-key"
```

### Pricing:
- Free tier: 100 credits ($10 value)
- Pay as you go: $0.02-0.10 per generation
- $20/month for 200 generations

---

## 🔐 Step 6: Authentication Setup (NextAuth)

```bash
npm install next-auth @next-auth/prisma-adapter
npm install bcryptjs
npm install -D @types/bcryptjs
```

Generate secret:
```bash
openssl rand -base64 32
```

Update `.env`:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"
```

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // Add custom pages, callbacks, etc.
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

## 🧪 Step 7: Test the Setup

### Test Database
```bash
npx prisma studio
# Should open at http://localhost:5555
```

### Test Upload API
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/model.stl"
```

### Test Generation API
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A red Ferrari sports car"}'
```

---

## 📁 Project Structure

```
model-car-website/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── upload/route.ts
│   │   ├── generate/route.ts
│   │   └── models/route.ts
│   └── studio/page.tsx
├── components/
│   ├── AIGenerationChat.tsx
│   ├── STLUploader.tsx
│   └── Studio3DViewer.tsx
├── lib/
│   └── prisma.ts
├── prisma/
│   └── schema.prisma
└── .env
```

---

## 🔒 Security Best Practices

1. **Never commit `.env`** - Add to `.gitignore`
2. **Use environment variables** for all secrets
3. **Rate limit APIs** - Prevent abuse
4. **Validate file types** - Only allow STL/OBJ/GLB
5. **Limit file sizes** - Max 50MB
6. **Authenticate uploads** - Require login
7. **Sanitize inputs** - Prevent injection attacks

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

---

## 💰 Cost Estimate

**Monthly costs for 1000 generations:**

| Service | Cost |
|---------|------|
| Supabase (Database) | Free - $10 |
| Cloudflare R2 (Storage) | Free - $5 |
| Tripo3D API | $20 - $100 |
| Vercel (Hosting) | Free - $20 |
| **Total** | **$20 - $135/month** |

---

## 🐛 Troubleshooting

### Database connection failed
```bash
# Check if PostgreSQL is running
brew services list # macOS
sudo systemctl status postgresql # Linux

# Test connection
psql -h localhost -U modelcar_user -d modelcar_db
```

### Upload fails
- Check S3/R2 credentials
- Verify bucket permissions
- Check file size limits

### Generation fails
- Verify Tripo3D API key
- Check credit balance
- Review prompt format

---

## 📚 Next Steps

1. ✅ Complete this setup guide
2. ✅ Test all API endpoints
3. 🔄 Integrate with frontend
4. 🎨 Add UI for file upload
5. 💳 Add payment system (Stripe)
6. 📊 Add analytics
7. 🌍 Deploy to production

---

## 🆘 Support

- Documentation: `/README_3D_CONVERSION.md`
- API Docs: Check each route file
- Tripo3D Docs: https://platform.tripo3d.ai/docs
- Prisma Docs: https://www.prisma.io/docs

**Ready to go? Run `npm run dev` and visit http://localhost:3000/studio**
