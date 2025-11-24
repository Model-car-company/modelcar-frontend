# 🚀 Getting Started - Production Setup

## Overview
This guide will help you deploy a production-ready 3D car model platform with:
- ✅ Secure Supabase authentication
- ✅ Protected routes and API endpoints
- ✅ User dashboard and profile management
- ✅ Credit-based AI generation system
- ✅ Zero exposed secrets or console logs

---

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed
- Code editor (VS Code recommended)

---

## 🛠️ Step-by-Step Setup

### Step 1: Clone and Install Dependencies

```bash
cd model-car-website
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Project name**: `offense-3d-models` (or your choice)
   - **Database password**: Strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" (takes ~2 minutes)

### Step 3: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (different long string)

### Step 4: Create Environment Variables

Create a file named `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

# Supabase Service Role (NEVER expose to client!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key

# Site URL (for OAuth callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI API Keys (optional for now)
GEMINI_API_KEY=your-gemini-key
MESHY_API_KEY=your-meshy-key
```

**⚠️ Important**: Never commit `.env.local` to git! It's already in `.gitignore`.

### Step 5: Run Database Migrations

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `SUPABASE_SETUP.md` SQL section
5. Paste into the query editor
6. Click **Run** (bottom right)
7. You should see "Success. No rows returned"

This creates:
- `profiles` table (user data)
- `models` table (3D models)
- `generations` table (AI generation history)
- Row Level Security policies
- Automatic user profile creation trigger

### Step 6: Configure Authentication

In Supabase Dashboard → **Authentication**:

1. Click **Settings** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   ```

3. Click **Providers** → **Email**
4. Enable **Email provider**
5. Disable "Confirm email" (optional, for easier testing)

### Step 7: Create Storage Buckets

In Supabase Dashboard → **Storage**:

1. Click **Create new bucket**
2. Create bucket named: `models`
   - **Public**: No (private)
   - **File size limit**: 50 MB
3. Click **Create bucket** named: `avatars`
   - **Public**: Yes
   - **File size limit**: 2 MB

### Step 8: Test Your Setup

```bash
npm run dev
```

Visit `http://localhost:3000` and you should see:
- Homepage with "SIGN IN" and "GET STARTED" buttons
- Clean, minimal dark UI
- No console errors

### Step 9: Create Your First Account

1. Click **GET STARTED** in the top right
2. Fill in:
   - Full Name
   - Email
   - Password (at least 6 characters)
3. Click **Create Account**
4. You should be redirected to `/dashboard`
5. You should see:
   - Welcome message with your name
   - 10 free credits
   - 0 models
   - 0 generations

**🎉 Success! Your auth system is working!**

---

## 🔒 Security Verification

Run these checks to ensure everything is secure:

### 1. Environment Variables Check
```bash
# This should print your URLs (safe)
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# This should be empty (server-only)
# Never access this from client components!
echo $SUPABASE_SERVICE_ROLE_KEY
```

### 2. Database Security Check

In Supabase Dashboard → **SQL Editor**, run:

```sql
-- Test RLS policies
SELECT * FROM profiles; -- Should only return YOUR profile
SELECT * FROM models; -- Should only return YOUR models
```

### 3. Browser Console Check

Open browser DevTools → Console:
- ✅ Should see no errors
- ✅ Should see no API keys
- ✅ Should see no service role keys
- ✅ Network tab should show only `/auth` and `/api` calls

---

## 📱 Features Available Now

### Public Pages (No Auth Required)
- ✅ Homepage: `http://localhost:3000`
- ✅ Sign In: `http://localhost:3000/sign-in`
- ✅ Sign Up: `http://localhost:3000/sign-up`

### Protected Pages (Auth Required)
- ✅ Dashboard: `http://localhost:3000/dashboard`
- ✅ 3D Studio: `http://localhost:3000/studio`

### Authentication Features
- ✅ Email/password sign up
- ✅ Email/password sign in
- ✅ Automatic profile creation
- ✅ Session management (cookies)
- ✅ Protected route middleware
- ✅ Sign out

### Database Features
- ✅ User profiles with credits
- ✅ Row Level Security (RLS)
- ✅ Automatic timestamps
- ✅ Cascading deletes

---

## 🧪 Testing the Flow

### Test 1: Sign Up Flow
1. Go to `http://localhost:3000`
2. Click "GET STARTED"
3. Create account with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Should redirect to `/dashboard`
5. Should see "Welcome back, Test User"
6. Should see 10 credits

### Test 2: Sign Out/In Flow
1. Click "SIGN OUT" in dashboard nav
2. Should redirect to homepage
3. Click "SIGN IN"
4. Enter same credentials
5. Should redirect back to dashboard
6. Credits and data should persist

### Test 3: Protected Routes
1. Sign out
2. Try visiting `http://localhost:3000/dashboard` directly
3. Should redirect to `/sign-in`
4. After signing in, should redirect back to dashboard

---

## 🚀 What's Next?

### Immediate Next Steps (30 min)
1. ✅ Update Studio to require authentication
2. ✅ Connect AI generation to credits system
3. ✅ Add credit deduction on generation
4. ✅ Create "My Models" library page

### Future Enhancements (1-2 hours each)
- Add profile settings page
- Add model upload functionality
- Add generation history
- Add pricing/payment page
- Add email verification
- Add password reset
- Add OAuth (Google/GitHub)

### Production Deployment (1 hour)
- Deploy to Vercel
- Update Supabase redirect URLs
- Add production environment variables
- Enable email confirmation
- Add rate limiting

---

## 🆘 Troubleshooting

### "Cannot connect to Supabase"
- Check `.env.local` has correct credentials
- Restart dev server: `npm run dev`
- Check Supabase project is not paused

### "User is not authenticated"
- Clear browser cookies
- Sign in again
- Check middleware.ts is not blocking routes

### "Database policy error"
- Check RLS policies were created correctly
- Run SQL migrations again
- Verify user exists in `auth.users` table

### "Build errors"
- Run `npm install` again
- Delete `.next` folder
- Run `npm run build`

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Auth Guide**: https://nextjs.org/docs/authentication
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Verification Checklist

Before going to production:

- [ ] All environment variables set in `.env.local`
- [ ] Database tables created with RLS enabled
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Dashboard shows correct user data
- [ ] Protected routes redirect properly
- [ ] No console errors or warnings
- [ ] No API keys visible in browser
- [ ] Middleware protects all /dashboard routes
- [ ] User profile auto-creates on signup
- [ ] Credits system initialized (10 free credits)

**Ready for production? Deploy to Vercel!** 🚀
