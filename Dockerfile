# Tangibel - Next.js Production Dockerfile
# Multi-stage build for optimal image size

FROM node:18-alpine AS base
# Install OpenSSL for Prisma/crypto support
RUN apk add --no-cache openssl

# Stage 1: Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

#############################
# Build-time environment
#############################
# Ensure Next.js runs in production mode so it loads .env.production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Public envs needed at build time (Next.js inlines NEXT_PUBLIC_* during build)
ENV NEXT_PUBLIC_SUPABASE_URL="https://mwyzvpadlfroamzjxlex.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eXp2cGFkbGZyb2Ftemp4bGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzYsImV4cCI6MjA3OTI1MjUzNn0.ZA1_vrD_80TAV6ETmA_bHViNPMxvylwLyB41oumvbjA"
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51Ons8KFjPH43v1P3k8o2x8H5Eh6IhAkekT8ldC8zgQaucDNxs55Iar4dZeoqXNhyDgBlboxuBSRNSUSrPEtXqQvq004uQKZMLp"
ENV NEXT_PUBLIC_SITE_URL="https://tangibel.io"
ENV NEXT_PUBLIC_BACKEND_URL="https://atelier-backend-362062855771.us-central1.run.app"
ENV NEXT_PUBLIC_APP_URL="https://www.tangibel.io"

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

#############################
# Runtime environment
#############################
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Public envs for runtime
ENV NEXT_PUBLIC_SUPABASE_URL="https://mwyzvpadlfroamzjxlex.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eXp2cGFkbGZyb2Ftemp4bGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzYsImV4cCI6MjA3OTI1MjUzNn0.ZA1_vrD_80TAV6ETmA_bHViNPMxvylwLyB41oumvbjA"
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51Ons8KFjPH43v1P3k8o2x8H5Eh6IhAkekT8ldC8zgQaucDNxs55Iar4dZeoqXNhyDgBlboxuBSRNSUSrPEtXqQvq004uQKZMLp"
ENV NEXT_PUBLIC_SITE_URL="https://tangibel.io"
ENV NEXT_PUBLIC_BACKEND_URL="https://atelier-backend-362062855771.us-central1.run.app"
ENV NEXT_PUBLIC_APP_URL="https://www.tangibel.io"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set up .next directory with correct permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
CMD HOSTNAME="0.0.0.0" node server.js
