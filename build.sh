#!/bin/bash

# Build script for Railway deployment
echo "🚀 Building RetailReady for Railway deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

echo "✅ Build completed successfully!"
