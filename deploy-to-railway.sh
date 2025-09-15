#!/bin/bash

# Railway Deployment Script for RetailReady
# This script helps prepare and deploy the application to Railway

echo "🚀 RetailReady Railway Deployment Script"
echo "========================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway:"
    railway login
fi

echo "📋 Pre-deployment checklist:"
echo "1. ✅ OpenAI API key ready"
echo "2. ✅ Code pushed to Git repository"
echo "3. ✅ Railway CLI installed and authenticated"

echo ""
echo "🚀 Starting deployment process..."

# Create Railway project (if not exists)
echo "📦 Creating Railway project..."
railway init

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001

echo "⚠️  IMPORTANT: You need to set your OpenAI API key manually:"
echo "   railway variables set OPENAI_API_KEY=your_actual_api_key_here"
echo ""

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment initiated!"
echo "📊 Monitor your deployment at: https://railway.app/dashboard"
echo "🌐 Your app will be available at the URL provided by Railway"
echo ""
echo "📖 For detailed instructions, see RAILWAY_DEPLOYMENT.md"
