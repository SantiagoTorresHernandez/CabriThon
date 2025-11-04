#!/bin/bash

# Deploy .NET 9 Web API to Google Cloud Run
# Usage: ./deploy-backend.sh

set -e

echo "🚀 Deploying CabriThon Backend to Google Cloud Run..."

# Configuration
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="cabrithon-api"
REGION="us-central1"

# Navigate to backend directory
cd ../backend

# Build and deploy
echo "Building and deploying..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars "ASPNETCORE_ENVIRONMENT=Production" \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1

echo "✅ Backend deployed successfully!"
echo "📝 Don't forget to:"
echo "   1. Set environment variables for Firebase and Supabase config"
echo "   2. Update CORS settings to include your frontend URL"
echo ""
echo "To set environment variables:"
echo "gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars FIREBASE__PROJECTID=your-project-id"

