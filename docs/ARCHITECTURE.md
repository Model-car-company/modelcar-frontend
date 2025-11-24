# Production Website Architecture Plan

## 🎯 Project Overview
Transform the Model Masters 3D car platform into a production-ready SaaS with Supabase authentication, user management, and secure database operations.

---

## 📋 Tech Stack

### Core
- **Framework**: Next.js 14.0.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (minimal dark theme)
- **Database & Auth**: Supabase
- **State Management**: React hooks + Server Components
- **3D Rendering**: Three.js / React Three Fiber

### Security & Best Practices
- Server-side environment variables only
- Row Level Security (RLS) on all tables
- Next.js Middleware for route protection
- Server Components for sensitive data
- No console.logs in production
- API routes with validation & rate limiting

---

## 🗄️ Database Schema

### Tables

#### 1. `profiles` (extends auth.users)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  credits_remaining INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 2. `models` (3D models library)
```sql
CREATE TABLE public.models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  model_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT,
  file_size_mb DECIMAL,
  category TEXT, -- supercar, classic, jdm, vintage
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view public models
CREATE POLICY "Public models are viewable by everyone"
  ON public.models FOR SELECT
  USING (is_public = true);

-- Policy: Users can view their own models
CREATE POLICY "Users can view own models"
  ON public.models FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own models
CREATE POLICY "Users can insert own models"
  ON public.models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own models
CREATE POLICY "Users can update own models"
  ON public.models FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own models
CREATE POLICY "Users can delete own models"
  ON public.models FOR DELETE
  USING (auth.uid() = user_id);
```

#### 3. `generations` (AI generation history)
```sql
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  generated_image_url TEXT,
  model_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own generations
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own generations
CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔐 Authentication Flow

### Sign Up
1. User enters email + password
2. Supabase creates auth.users record
3. Trigger creates profiles record
4. Send email verification (optional)
5. Redirect to dashboard

### Sign In
1. User enters credentials
2. Supabase validates
3. Next.js middleware checks auth
4. Redirect to dashboard or requested page

### Session Management
- Server-side session cookies (HTTP-only)
- Automatic token refresh
- Middleware checks on protected routes

---

## 📁 File Structure

```
app/
├── (auth)/
│   ├── sign-in/
│   │   └── page.tsx          # Sign in page
│   ├── sign-up/
│   │   └── page.tsx          # Sign up page
│   └── forgot-password/
│       └── page.tsx          # Password reset
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx          # User dashboard
│   ├── models/
│   │   └── page.tsx          # User's models library
│   └── profile/
│       └── page.tsx          # User profile settings
├── api/
│   ├── auth/
│   │   ├── callback/         # OAuth callback
│   │   └── sign-out/         # Sign out endpoint
│   ├── models/
│   │   ├── upload/           # Model upload
│   │   └── [id]/             # Get/update/delete model
│   └── generations/
│       └── create/           # Create new generation
├── middleware.ts             # Route protection
├── page.tsx                  # Public homepage
└── studio/
    └── page.tsx              # 3D studio (protected)

lib/
├── supabase/
│   ├── client.ts             # Client-side Supabase
│   ├── server.ts             # Server-side Supabase
│   └── middleware.ts         # Middleware helper
└── utils/
    ├── auth.ts               # Auth utilities
    └── validation.ts         # Input validation

components/
├── auth/
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   └── AuthProvider.tsx
├── dashboard/
│   ├── DashboardNav.tsx
│   ├── ModelCard.tsx
│   └── StatsCard.tsx
└── layout/
    ├── PublicNav.tsx         # Public navigation
    └── DashboardNav.tsx      # Protected navigation
```

---

## 🛡️ Security Implementation

### 1. Environment Variables
```env
# .env.local (NEVER commit this)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx... (safe for client)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (SERVER ONLY - never expose)

# API Keys (SERVER ONLY)
GEMINI_API_KEY=xxx
MESHY_API_KEY=xxx
```

### 2. Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Public data explicitly marked as public
- Service role bypasses RLS (server-side only)

### 3. Middleware Protection
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Protect /dashboard, /studio, /profile routes
  // Redirect unauthenticated users to /sign-in
  // Allow authenticated users through
}
```

### 4. API Route Security
- Validate all inputs (Zod schemas)
- Check authentication on every request
- Rate limiting (10 req/min per user)
- Never return sensitive data

### 5. No Client-Side Secrets
- API keys only in server components / API routes
- Environment variables prefixed with NEXT_PUBLIC_ are safe
- All others are server-only

---

## 🎨 Page Designs

### 1. Public Homepage (/)
**Layout**: Same minimal dark aesthetic
- Hero section with CTA: "Get Started Free"
- Features showcase
- Pricing tiers
- Footer with sign up

### 2. Sign In (/sign-in)
**Layout**: Centered card on dark background
- Email + password fields
- "Sign in with Google" button
- "Forgot password?" link
- "Don't have an account? Sign up"

### 3. Sign Up (/sign-up)
**Layout**: Similar to sign in
- Email, password, confirm password
- Terms acceptance checkbox
- OAuth options
- "Already have an account? Sign in"

### 4. Dashboard (/dashboard)
**Layout**: Sidebar + main content
- **Sidebar**: Navigation (Dashboard, Models, Studio, Profile, Sign Out)
- **Main**: 
  - Welcome message
  - Stats cards (models, generations, credits)
  - Recent activity
  - Quick actions

### 5. Models Library (/models)
**Layout**: Grid of model cards
- Filter by category
- Search bar
- Each card: thumbnail, name, download button
- "Upload Model" button

### 6. Studio (/studio)
**Protected**: Same as current studio
- Only accessible to authenticated users
- Generations count against user credits

---

## 🚀 Implementation Order

### Phase 1: Supabase Setup (30 min)
1. Create Supabase project
2. Set up database tables
3. Configure RLS policies
4. Create storage buckets

### Phase 2: Auth Infrastructure (45 min)
5. Install Supabase packages
6. Create lib/supabase helpers
7. Build middleware for route protection
8. Create auth API routes

### Phase 3: Auth UI (1 hour)
9. Sign in page
10. Sign up page
11. Forgot password page
12. Auth forms with validation

### Phase 4: Protected Pages (1 hour)
13. Dashboard layout
14. Dashboard page
15. Models library page
16. Profile settings page

### Phase 5: API Endpoints (1 hour)
17. Models CRUD API
18. Generations API
19. Profile update API

### Phase 6: Integration (30 min)
20. Update Studio to require auth
21. Connect AI generation to credits
22. Test full flow

### Phase 7: Production Prep (30 min)
23. Remove all console.logs
24. Add error boundaries
25. Environment variable validation
26. Build and test

---

## 📊 User Flow Example

1. **New User Visits** → Homepage
2. **Clicks "Get Started"** → Sign up page
3. **Signs Up** → Email verification (optional) → Redirected to dashboard
4. **Views Dashboard** → Sees 10 free credits, welcome message
5. **Clicks "Generate Model"** → Opens studio
6. **Generates Image** → Uses 1 credit (9 remaining)
7. **Converts to 3D** → Uses 1 credit (8 remaining)
8. **Downloads Model** → Saved to "My Models" library
9. **Signs Out** → Returns to homepage

---

## 🔄 Data Flow

### Client → Server
1. User action in browser (e.g., "Generate")
2. Client-side validation
3. API call to Next.js route handler
4. Server validates request + auth
5. Server calls Supabase with service role key
6. Supabase enforces RLS
7. Data returned to client (sanitized)

### Authentication Flow
- Client uses `@supabase/ssr` for cookies
- Server uses service role for admin operations
- Middleware checks auth before protected routes
- Sessions stored in HTTP-only cookies

---

## ✅ Security Checklist

- [ ] All database tables have RLS enabled
- [ ] Service role key is never exposed to client
- [ ] All API routes validate authentication
- [ ] Input validation on all forms (Zod)
- [ ] Rate limiting on API routes
- [ ] HTTPS enforced in production
- [ ] Environment variables validated at startup
- [ ] No console.logs in production code
- [ ] Error messages don't leak sensitive info
- [ ] CORS configured properly
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (React escapes by default)

---

## 📈 Scalability Considerations

### Now (MVP)
- Simple credit system
- Basic model storage
- Single Supabase project

### Future
- Stripe integration for payments
- CDN for 3D models
- Background jobs for AI processing
- Model versioning
- Collaboration features
- Analytics dashboard

---

**Ready to implement? This architecture provides:**
✅ Secure authentication
✅ Protected routes
✅ Scalable database
✅ Beautiful UI (existing design system)
✅ Production-ready code
✅ Zero exposed secrets

Estimated implementation time: **4-5 hours** for full MVP
