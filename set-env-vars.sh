#!/bin/bash

# Tangibel - Set Environment Variables in Cloud Run
# Reads from .env file and updates Cloud Run service

set -e

SERVICE_NAME="tangibel-frontend"
REGION="us-central1"

echo "🔐 Setting Environment Variables in Cloud Run"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  echo "Please create a .env file with your environment variables"
  exit 1
fi

echo "Reading variables from .env file..."
echo ""

# Read .env and build the env vars string
ENV_VARS=""
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue
  
  # Remove quotes from value
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  
  # Skip empty values
  [[ -z $value ]] && continue
  
  # Add to ENV_VARS string
  if [ -z "$ENV_VARS" ]; then
    ENV_VARS="$key=$value"
  else
    ENV_VARS="$ENV_VARS,$key=$value"
  fi
  
  echo "  ✓ $key"
done < .env

echo ""
echo "Updating Cloud Run service with environment variables..."

gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --set-env-vars="$ENV_VARS"

echo ""
echo "✅ Environment variables updated successfully!"
echo ""
echo "To verify, run:"
echo "  gcloud run services describe $SERVICE_NAME --region $REGION"
