#!/bin/bash

echo "🚀 Installing Complete Backend Dependencies..."
echo ""

# Core dependencies
echo "📦 Installing core packages..."
npm install @prisma/client prisma
npm install @aws-sdk/client-s3
npm install next-auth @next-auth/prisma-adapter
npm install nanoid
npm install zod
npm install bcryptjs

# Dev dependencies
echo "📦 Installing dev dependencies..."
npm install -D @types/bcryptjs
npm install -D prisma

echo ""
echo "✅ Dependencies installed!"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual credentials"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "🗄️  Setting up database..."
echo "Run these commands next:"
echo ""
echo "  1. npx prisma generate       # Generate Prisma Client"
echo "  2. npx prisma migrate dev    # Create database tables"
echo "  3. npx prisma studio         # View database (optional)"
echo ""
echo "📚 Read SETUP_GUIDE.md for complete instructions"
echo ""
