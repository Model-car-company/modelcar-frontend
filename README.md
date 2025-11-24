# Offense - AI-Powered 3D Car Model Platform

> Transform car images into production-ready 3D models with AI

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📚 Documentation

All documentation is in the `/docs` folder:

- **[Getting Started](./docs/QUICK_START.md)** - Quick setup guide
- **[Full Documentation Index](./docs/README.md)** - Complete documentation overview
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database configuration
- **[Security Checklist](./docs/SECURITY_CHECKLIST.md)** - Security guide

## ✨ Features

- 🎨 **AI Image Generation** - Generate custom car images with AI
- 🚗 **3D Conversion** - Convert images to 3D models
- 💳 **Credit System** - Flexible usage-based pricing
- 🔐 **Authentication** - Secure user management with Supabase
- 📊 **Dashboard** - Track generations and credits

## 🛠️ Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: Google Gemini, Image-to-3D APIs
- **3D**: Three.js, React Three Fiber
- **Animations**: Framer Motion

## 📦 Project Structure

```
/app              → Next.js pages and routes
/components       → React components
/lib              → Utilities and helpers
/docs             → Documentation
/public           → Static assets
```

## 🔒 Environment Variables

Required variables in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

See `.env.example` for all options.

## 📝 License

Proprietary - All rights reserved

---

**Need help?** Check the [docs folder](./docs/) for detailed guides.