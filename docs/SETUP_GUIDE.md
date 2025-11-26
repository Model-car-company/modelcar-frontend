# Supabase-Only Backend Setup

This project now uses **Supabase only** for auth, database, storage, and RLS. Prisma is no longer required.

## Prerequisites
- Node.js 18+
- Supabase project (free tier is fine)
- Stripe account (for subscriptions)
- Optional: AWS S3/Cloudflare R2 for external storage

## 1) Configure environment
Copy `.env.example` to `.env.local` and fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Stripe keys + price IDs (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs)
- `NEXT_PUBLIC_BACKEND_URL` (your AI backend) and `NEXT_PUBLIC_APP_URL`

## 2) Apply Supabase migrations
You can run these in the Supabase **SQL Editor** in order:
1. `supabase/migrations/000_create_profiles_base.sql`
2. `supabase/migrations/add_stripe_subscription_columns.sql`
3. `supabase/migrations/003_credits_system.sql`
4. `supabase/migrations/create_user_assets.sql`

What you get:
- `profiles` table with credits, subscription fields, RLS, and triggers to auto-create a profile for new users.
- Credits safeguards and audit log.
- `user_assets` table for generated images/models (RLS enabled).
- Stripe customer/subscription columns.

## 3) Buckets and storage
In Supabase Storage create:
- `car-images` (used in image generation upload). Make it public if you want public URLs, or keep private and serve via signed URLs.
- Optional buckets for other assets as needed.

## 4) Stripe webhooks
Point your Stripe webhook to:
```
<APP_URL>/api/webhooks/stripe
```
Set `STRIPE_WEBHOOK_SECRET` accordingly.

## 5) Run the app
```bash
npm install
npm run dev
# visit http://localhost:3000
```

## Notes
- Profile rows are auto-created via the `on_auth_user_created` trigger. No Prisma client or migrations are needed.
- All DB interactions use Supabase JS clients (`lib/supabase/*`).
