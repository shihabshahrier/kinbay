#!/bin/bash
# deploy.sh - Deploy backend to Google Cloud Run

set -e

# Configuration
PROJECT_ID=${1:-"your-gcp-project-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME="kinbay-backend"
REPOSITORY="kinbay-repo"

echo "🚀 Deploying Kinbay Backend to Cloud Run..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Set project
gcloud config set project $PROJECT_ID

# Build and push image
echo "📦 Building and pushing Docker image..."
IMAGE_TAG=$(git rev-parse --short HEAD)
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/backend:$IMAGE_TAG"

gcloud builds submit --tag $IMAGE_NAME

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --set-secrets JWT_ACCESS_SECRET=JWT_ACCESS_SECRET:latest \
  --set-secrets JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest \
  --set-env-vars CORS_ORIGIN="https://your-app.pages.dev"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "✅ Deployment complete!"
echo "🔗 Service URL: $SERVICE_URL"
echo "🏥 Health check: $SERVICE_URL/health"
echo "📊 GraphQL: $SERVICE_URL/graphql"

echo ""
echo "Next steps:"
echo "1. Update your Cloudflare Pages environment variable VITE_BACKEND_URL to: $SERVICE_URL"
echo "2. Test the health endpoint: curl $SERVICE_URL/health"
echo "3. Test GraphQL: curl $SERVICE_URL/graphql"