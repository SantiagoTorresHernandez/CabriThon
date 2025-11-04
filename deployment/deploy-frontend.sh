#!/bin/bash

# Deploy React Frontend to Firebase Hosting
# Usage: ./deploy-frontend.sh

set -e

echo "🚀 Deploying CabriThon Frontend to Firebase Hosting..."

# Navigate to frontend directory
cd ../frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building production build..."
npm run build

# Deploy to Firebase Hosting
echo "📤 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Frontend deployed successfully!"
echo "📝 Don't forget to:"
echo "   1. Update .env with production API URL"
echo "   2. Verify Firebase configuration"
echo "   3. Test the deployed application"

