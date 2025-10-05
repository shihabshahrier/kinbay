#!/bin/bash
# setup-gcp.sh - Initial setup for GCP deployment

set -e

PROJECT_ID=${1:-"your-gcp-project-id"}
REGION=${2:-"us-central1"}

if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
    echo "❌ Error: Please provide your GCP Project ID"
    echo "Usage: ./setup-gcp.sh YOUR_PROJECT_ID [REGION]"
    exit 1
fi

echo "🔧 Setting up GCP for Kinbay Backend deployment..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📡 Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com

# Create Artifact Registry repository
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create kinbay-repo \
  --repository-format=docker \
  --location=$REGION \
  --description="Kinbay backend Docker images" || echo "Repository might already exist"

# Create secrets (you'll need to update these with real values)
echo "🔐 Creating secrets in Secret Manager..."

# Prompt for DATABASE_URL
echo ""
echo "Please enter your Neon PostgreSQL connection string:"
echo "Format: postgresql://username:password@host.neon.tech/dbname?sslmode=require"
read -p "DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL is required"
    exit 1
fi

# Generate JWT secrets
echo "🎲 Generating JWT secrets..."
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Create secrets
echo "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=- || echo "DATABASE_URL secret might already exist"
echo "$JWT_ACCESS_SECRET" | gcloud secrets create JWT_ACCESS_SECRET --data-file=- || echo "JWT_ACCESS_SECRET secret might already exist"
echo "$JWT_REFRESH_SECRET" | gcloud secrets create JWT_REFRESH_SECRET --data-file=- || echo "JWT_REFRESH_SECRET secret might already exist"

echo "✅ GCP setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: ./deploy.sh $PROJECT_ID $REGION"
echo "2. Update your frontend environment variables with the Cloud Run URL"
echo ""
echo "Generated JWT secrets have been stored in Secret Manager."
echo "DATABASE_URL: [HIDDEN]"
echo "JWT_ACCESS_SECRET: $JWT_ACCESS_SECRET"
echo "JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET"