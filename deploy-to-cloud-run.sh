#!/bin/bash

# Tangibel - Cloud Run Deployment Script
# Deploys Next.js app to Google Cloud Run
# Public vars are baked into Docker image, secrets are set at runtime

set -e

echo "🚀 Tangibel Cloud Run Deployment"
echo "================================="
echo ""

# Configuration
PROJECT_ID="serious-conduit-448301-d7"
SERVICE_NAME="tangibel-frontend"
REGION="us-central1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Setting Google Cloud project${NC}"
gcloud config set project $PROJECT_ID

echo ""
echo -e "${BLUE}Step 2: Reading secrets from .env file${NC}"
if [ ! -f .env ]; then
  echo -e "${YELLOW}Warning: .env file not found.${NC}"
  exit 1
fi

# Read secrets from .env (these go to Cloud Run runtime, NOT Docker image)
source <(grep -E '^(STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|SUPABASE_SERVICE_ROLE_KEY|STRIPE_.*_PRICE_ID)=' .env | sed 's/^/export /')

echo "  ✓ Secrets loaded (will be set as Cloud Run env vars)"

# Build substitutions string for runtime secrets
SUBSTITUTIONS="_STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}"
SUBSTITUTIONS="${SUBSTITUTIONS},_SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_GARAGE_MONTHLY_PRICE_ID=${STRIPE_GARAGE_MONTHLY_PRICE_ID}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_GARAGE_YEARLY_PRICE_ID=${STRIPE_GARAGE_YEARLY_PRICE_ID}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_SHOWROOM_MONTHLY_PRICE_ID=${STRIPE_SHOWROOM_MONTHLY_PRICE_ID}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_SHOWROOM_YEARLY_PRICE_ID=${STRIPE_SHOWROOM_YEARLY_PRICE_ID}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_DEALERSHIP_MONTHLY_PRICE_ID=${STRIPE_DEALERSHIP_MONTHLY_PRICE_ID}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_DEALERSHIP_YEARLY_PRICE_ID=${STRIPE_DEALERSHIP_YEARLY_PRICE_ID}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_FACTORY_MONTHLY_PRICE_ID=${STRIPE_FACTORY_MONTHLY_PRICE_ID}"
SUBSTITUTIONS="${SUBSTITUTIONS},_STRIPE_FACTORY_YEARLY_PRICE_ID=${STRIPE_FACTORY_YEARLY_PRICE_ID}"

echo ""
echo -e "${BLUE}Step 3: Building and deploying with Cloud Build${NC}"
echo "This may take 5-10 minutes..."
echo ""
echo "  📦 Public vars → baked into Docker image (safe)"
echo "  🔐 Secrets → set as Cloud Run env vars (secure)"

# Submit the build with runtime secrets as substitutions
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions="$SUBSTITUTIONS" \
  --region=$REGION

echo ""
echo -e "${GREEN}✓ Service deployed successfully!${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo -e "Cloud Run URL: ${BLUE}$SERVICE_URL${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Your site should be live at:"
echo "  - $SERVICE_URL"
echo "  - https://tangibel.io (if DNS is configured)"
echo ""
