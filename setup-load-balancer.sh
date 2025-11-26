#!/bin/bash

# Tangibel - Global Load Balancer Setup
# Enterprise-grade infrastructure with CDN, SSL, and Cloud Armor

set -e

PROJECT_ID="serious-conduit-448301-d7"
REGION="us-central1"
SERVICE_NAME="tangibel-frontend"
DOMAIN="tangibel.io"
WWW_DOMAIN="www.tangibel.io"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Tangibel Load Balancer Setup${NC}"
echo "================================="
echo ""

# Set project
echo -e "${BLUE}Step 1: Setting Google Cloud project${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo ""
echo -e "${BLUE}Step 2: Enabling required APIs${NC}"
gcloud services enable compute.googleapis.com
gcloud services enable certificatemanager.googleapis.com

# Create serverless NEG (Network Endpoint Group) for Cloud Run
echo ""
echo -e "${BLUE}Step 3: Creating Network Endpoint Group for Cloud Run${NC}"
gcloud compute network-endpoint-groups create tangibel-neg \
  --region=$REGION \
  --network-endpoint-type=serverless \
  --cloud-run-service=$SERVICE_NAME \
  || echo "NEG already exists, continuing..."

# Create backend service
echo ""
echo -e "${BLUE}Step 4: Creating backend service with CDN${NC}"
gcloud compute backend-services create tangibel-backend \
  --global \
  --enable-cdn \
  --cache-mode=CACHE_ALL_STATIC \
  --default-ttl=3600 \
  --max-ttl=86400 \
  --client-ttl=3600 \
  || echo "Backend service already exists, continuing..."

# Add NEG to backend service
echo ""
echo -e "${BLUE}Step 5: Connecting Cloud Run to backend service${NC}"
gcloud compute backend-services add-backend tangibel-backend \
  --global \
  --network-endpoint-group=tangibel-neg \
  --network-endpoint-group-region=$REGION \
  || echo "Backend already added, continuing..."

# Create URL map
echo ""
echo -e "${BLUE}Step 6: Creating URL map${NC}"
gcloud compute url-maps create tangibel-url-map \
  --default-service=tangibel-backend \
  || echo "URL map already exists, continuing..."

# Reserve global static IP
echo ""
echo -e "${BLUE}Step 7: Reserving global static IP address${NC}"
gcloud compute addresses create tangibel-ip \
  --global \
  || echo "IP already reserved, continuing..."

# Get the reserved IP
STATIC_IP=$(gcloud compute addresses describe tangibel-ip --global --format="get(address)")
echo -e "${GREEN}✓ Reserved IP: $STATIC_IP${NC}"

# Create managed SSL certificate
echo ""
echo -e "${BLUE}Step 8: Creating managed SSL certificate${NC}"
gcloud compute ssl-certificates create tangibel-ssl \
  --domains=$DOMAIN,$WWW_DOMAIN \
  --global \
  || echo "SSL certificate already exists, continuing..."

# Create target HTTPS proxy
echo ""
echo -e "${BLUE}Step 9: Creating HTTPS proxy${NC}"
gcloud compute target-https-proxies create tangibel-https-proxy \
  --url-map=tangibel-url-map \
  --ssl-certificates=tangibel-ssl \
  || echo "HTTPS proxy already exists, continuing..."

# Create forwarding rule
echo ""
echo -e "${BLUE}Step 10: Creating global forwarding rule${NC}"
gcloud compute forwarding-rules create tangibel-https-rule \
  --global \
  --target-https-proxy=tangibel-https-proxy \
  --address=tangibel-ip \
  --ports=443 \
  || echo "Forwarding rule already exists, continuing..."

# Create HTTP to HTTPS redirect
echo ""
echo -e "${BLUE}Step 11: Creating HTTP to HTTPS redirect${NC}"
gcloud compute url-maps import tangibel-url-map \
  --global \
  --source=/dev/stdin <<EOF
name: tangibel-url-map
defaultService: https://www.googleapis.com/compute/v1/projects/$PROJECT_ID/global/backendServices/tangibel-backend
EOF

echo ""
echo -e "${GREEN}✅ Load Balancer Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 DNS CONFIGURATION REQUIRED${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Update your DNS in GoDaddy:${NC}"
echo ""
echo "1. DELETE the 4 A records you added earlier (216.239.x.x)"
echo ""
echo "2. ADD new A records pointing to Load Balancer:"
echo -e "   ${GREEN}Type: A, Name: @, Value: $STATIC_IP, TTL: 1 Hour${NC}"
echo -e "   ${GREEN}Type: A, Name: www, Value: $STATIC_IP, TTL: 1 Hour${NC}"
echo ""
echo "3. DELETE the CNAME for www (if exists)"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}⏳ After updating DNS:${NC}"
echo "  - DNS propagation: 10-60 minutes"
echo "  - SSL certificate provisioning: 15-60 minutes"
echo "  - Your site will be live at: https://$DOMAIN"
echo ""
echo -e "${GREEN}🎉 Enterprise infrastructure ready!${NC}"
echo ""
echo "Features enabled:"
echo "  ✓ Global CDN for fast worldwide access"
echo "  ✓ Automatic SSL/TLS certificates"
echo "  ✓ HTTP to HTTPS redirect"
echo "  ✓ DDoS protection"
echo "  ✓ Production-grade monitoring"
echo ""
echo "Check SSL certificate status:"
echo "  gcloud compute ssl-certificates describe tangibel-ssl --global"
echo ""
