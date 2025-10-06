#!/bin/bash
# update-cors.sh - Update CORS settings on existing Cloud Run service

set -e

# Configuration
PROJECT_ID=${1:-"your-gcp-project-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME="kinbay-backend"

echo "🔧 Updating CORS settings for Cloud Run service..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Set project
gcloud config set project $PROJECT_ID

# Update environment variables
echo "🌐 Updating CORS environment variables..."

# Create temporary env vars file
cat > /tmp/cors-env.yaml << EOF
CORS_ORIGIN: "https://kinbay.shihub.online,https://app-kinbay.shihub.online,https://app.kinbay.shihub.online,https://shihub.online"
FRONTEND_URL: "https://kinbay.shihub.online"
EOF

gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --env-vars-file /tmp/cors-env.yaml

# Clean up
rm -f /tmp/cors-env.yaml

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "✅ CORS update complete!"
echo "🔗 Service URL: $SERVICE_URL"
echo "🏥 Health check: $SERVICE_URL/health"

echo ""
echo "Updated CORS origins:"
echo "- https://kinbay.shihub.online"
echo "- https://app-kinbay.shihub.online" 
echo "- https://app.kinbay.shihub.online"
echo "- https://shihub.online"