#!/bin/bash

# WorkApp Enterprise - One-Click Deploy Script
# This script automates the deployment process to Vercel

echo "🚀 Starting WorkApp Enterprise Deployment..."
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check for environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local from example..."
    cp .env.example .env.local 2>/dev/null || true
    echo "⚠️  Please configure your environment variables in .env.local"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - GROQ_API_KEY"
fi

# Build the project
echo "🔨 Building project..."
pnpm build

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📡 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "📱 Your WorkApp Enterprise is now live!"
echo "🔗 Check your Vercel dashboard for the live URL."