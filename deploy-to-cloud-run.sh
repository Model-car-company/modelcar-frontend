#!/bin/bash

# Tangibel - Cloud Run Deployment Script
# Deploys Next.js app to Google Cloud Run and configures custom domain

set -e

echo "🚀 Tangibel Cloud Run Deployment"
echo "================================="
echo ""

# Configuration
PROJECT_ID="serious-conduit-448301-d7"
SERVICE_NAME="tangibel-frontend"
REGION="us-central1"
DOMAIN="tangibel.io"
WWW_DOMAIN="www.tangibel.io"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Setting Google Cloud project${NC}"
gcloud config set project $PROJECT_ID

echo ""
echo -e "${BLUE}Step 2: Loading environment variables from .env file${NC}"
if [ ! -f .env ]; then
  echo -e "${YELLOW}Warning: .env file not found. Build may fail without environment variables.${NC}"
  exit 1
fi

# Parse .env file and create substitutions for Cloud Build
SUBSTITUTIONS=""
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue
  [[ $key != NEXT_PUBLIC_* ]] && continue
  
  # Remove quotes from value
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  
  # Skip empty values
  [[ -z $value ]] && continue
  
  # Add to substitutions string
  if [ -z "$SUBSTITUTIONS" ]; then
    SUBSTITUTIONS="_${key}=${value}"
  else
    SUBSTITUTIONS="${SUBSTITUTIONS},_${key}=${value}"
  fi
  
  echo "  ✓ $key"
done < .env

echo "Loaded build variables"

echo ""
echo -e "${BLUE}Step 3: Building and deploying with Cloud Build${NC}"
echo "This may take 5-10 minutes..."

# Submit the build using cloudbuild.yaml
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions="$SUBSTITUTIONS" \
  --region=$REGION

echo ""
echo -e "${GREEN}✓ Service deployed successfully!${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo -e "Cloud Run URL: ${BLUE}$SERVICE_URL${NC}"

echo ""
echo -e "${BLUE}Step 4: Mapping custom domain to Cloud Run${NC}"

# Check if domain mapping already exists
if gcloud run domain-mappings describe $DOMAIN --region $REGION &>/dev/null; then
  echo "Domain mapping already exists for $DOMAIN"
else
  echo "Creating domain mapping for $DOMAIN..."
  gcloud run domain-mappings create \
    --service $SERVICE_NAME \
    --domain $DOMAIN \
    --region $REGION
fi

# Map www subdomain
if gcloud run domain-mappings describe $WWW_DOMAIN --region $REGION &>/dev/null; then
  echo "Domain mapping already exists for $WWW_DOMAIN"
else
  echo "Creating domain mapping for $WWW_DOMAIN..."
  gcloud run domain-mappings create \
    --service $SERVICE_NAME \
    --domain $WWW_DOMAIN \
    --region $REGION
fi

echo ""
echo -e "${GREEN}✓ Domain mappings created!${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 DNS CONFIGURATION REQUIRED${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Please add these DNS records in GoDaddy for tangibel.io:"
echo ""
echo -e "${BLUE}A Records (add all 4):${NC}"
echo "  Type: A, Name: @, Value: 216.239.32.21, TTL: 1 Hour"
echo "  Type: A, Name: @, Value: 216.239.34.21, TTL: 1 Hour"
echo "  Type: A, Name: @, Value: 216.239.36.21, TTL: 1 Hour"
echo "  Type: A, Name: @, Value: 216.239.38.21, TTL: 1 Hour"
echo ""
echo -e "${BLUE}AAAA Records (add all 4 for IPv6):${NC}"
echo "  Type: AAAA, Name: @, Value: 2001:4860:4802:32::15, TTL: 1 Hour"
echo "  Type: AAAA, Name: @, Value: 2001:4860:4802:34::15, TTL: 1 Hour"
echo "  Type: AAAA, Name: @, Value: 2001:4860:4802:36::15, TTL: 1 Hour"
echo "  Type: AAAA, Name: @, Value: 2001:4860:4802:38::15, TTL: 1 Hour"
echo ""
echo -e "${BLUE}CNAME Record (for www):${NC}"
echo "  Type: CNAME, Name: www, Value: ghs.googlehosted.com, TTL: 1 Hour"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}⏳ After adding DNS records:${NC}"
echo "  - DNS propagation takes 10-60 minutes (up to 48 hours)"
echo "  - SSL certificate will auto-provision (may take 15-30 minutes)"
echo "  - Check status: gcloud run domain-mappings describe $DOMAIN --region $REGION"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Add DNS records to GoDaddy (see above)"
echo "  2. Set environment variables (see below)"
echo "  3. Wait for DNS propagation"
echo "  4. Visit https://tangibel.io"
echo ""
echo -e "${BLUE}To set environment variables:${NC}"
echo "  gcloud run services update $SERVICE_NAME --region $REGION \\"
echo "    --set-env-vars=\"NEXT_PUBLIC_SUPABASE_URL=your-url,NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key\""
echo ""
