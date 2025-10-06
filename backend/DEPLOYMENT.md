# Kinbay Backend - GCP Deployment

This backend is ready for deployment to Google Cloud Run with Neon PostgreSQL.

## Prerequisites

1. **Google Cloud Project**: Create a GCP project and enable billing
2. **Neon Database**: Create a Neon PostgreSQL database and get connection string
3. **gcloud CLI**: Install and authenticate with `gcloud auth login`

## Quick Deployment

### 1. Initial Setup
```bash
# Run setup script with your GCP project ID
./setup-gcp.sh YOUR_GCP_PROJECT_ID

# This will:
# - Enable required GCP APIs
# - Create Artifact Registry repository
# - Create secrets in Secret Manager
# - Generate JWT secrets
```

### 2. Deploy
```bash
# Deploy to Cloud Run
./deploy.sh YOUR_GCP_PROJECT_ID

# This will:
# - Build Docker image
# - Push to Artifact Registry
# - Deploy to Cloud Run
# - Output service URL
```

### 3. Update Frontend
Update your Cloudflare Pages environment variable:
```
VITE_BACKEND_URL=https://your-service-url.run.app
```

## Manual Setup (Alternative)

### 1. Enable GCP APIs
```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

### 2. Create Artifact Registry
```bash
gcloud artifacts repositories create kinbay-repo \
  --repository-format=docker \
  --location=us-central1
```

### 3. Store Secrets
```bash
# Database URL from Neon
echo "postgresql://user:pass@host.neon.tech/db?sslmode=require" | gcloud secrets create DATABASE_URL --data-file=-

# JWT Secrets (generate random strings)
echo "your-access-secret" | gcloud secrets create JWT_ACCESS_SECRET --data-file=-
echo "your-refresh-secret" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-
```

### 4. Build and Deploy
```bash
# Build image
IMAGE=us-central1-docker.pkg.dev/PROJECT_ID/kinbay-repo/backend:latest
gcloud builds submit --tag $IMAGE

# Deploy to Cloud Run
gcloud run deploy kinbay-backend \
  --image $IMAGE \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --set-secrets JWT_ACCESS_SECRET=JWT_ACCESS_SECRET:latest \
  --set-secrets JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest \
  --set-env-vars NODE_ENV=production \
  --set-env-vars CORS_ORIGIN="https://kinbay.shihub.online,https://app-kinbay.shihub.online,https://app.kinbay.shihub.online" \
  --set-env-vars FRONTEND_URL="https://kinbay.shihub.online"
```

## Environment Variables

The following environment variables are configured automatically:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `NODE_ENV=production` - Production mode
- `CORS_ORIGIN` - Allowed frontend origins (kinbay.shihub.online, app-kinbay.shihub.online, app.kinbay.shihub.online)
- `FRONTEND_URL` - Primary frontend URL for redirects and references

## Features

✅ **Production Ready**
- Docker containerization
- Health checks
- Non-root user security
- Optimized multi-stage build

✅ **Security**
- HTTP-only cookies for refresh tokens
- CORS protection
- Secure cross-origin support
- SameSite=None for production

✅ **Scalability**
- Auto-scaling Cloud Run
- Connection pooling with Neon
- Efficient Docker layers

✅ **Monitoring**
- Health endpoint at `/health`
- Cloud Run built-in monitoring
- Structured logging

## Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /graphql` - GraphQL endpoint
- `POST /auth/login` - Secure login with cookies
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Logout

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in Secret Manager
- Check Neon database is active
- Ensure connection string includes `?sslmode=require`

### CORS Issues
- Update CORS_ORIGIN environment variable to include all frontend domains:
  ```bash
  # Use the update-cors.sh script for quick updates
  ./update-cors.sh YOUR_PROJECT_ID us-central1
  ```
- Current allowed domains:
  - `https://kinbay.shihub.online` (main domain)
  - `https://app-kinbay.shihub.online` (app subdomain with hyphen)
  - `https://app.kinbay.shihub.online` (app subdomain with dot)
- Verify frontend domain matches exactly (no wildcards in CORS)
- Check cookies are sent with `credentials: 'include'`

### Cookie Issues
- Ensure frontend is HTTPS (required for cross-origin cookies)
- Verify SameSite=None is set in production
- Check cookie domain settings

### Build Issues
- Verify all dependencies are in package.json
- Check TypeScript compilation
- Ensure Prisma client is generated