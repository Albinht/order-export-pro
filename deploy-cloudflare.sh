#!/bin/bash

# Cloudflare Pages Deployment Script
echo "🚀 Starting Cloudflare Pages Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Installing wrangler...${NC}"
    npm install -g wrangler
fi

# Check for required environment variables
if [ ! -f .env.production.local ]; then
    echo -e "${RED}❌ .env.production.local not found!${NC}"
    echo -e "${YELLOW}Please create .env.production.local with:${NC}"
    echo "DATABASE_URL=libsql://your-database.turso.io"
    echo "DATABASE_AUTH_TOKEN=your-turso-token"
    exit 1
fi

# Build the project
echo -e "${YELLOW}📦 Building project...${NC}"
npm run build:cloudflare

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Deploy to Cloudflare Pages
echo -e "${YELLOW}🚀 Deploying to Cloudflare Pages...${NC}"
npx wrangler pages deploy .next \
    --project-name=shopify-order-export \
    --compatibility-date=2024-01-01 \
    --compatibility-flags=nodejs_compat

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🎉 Your app is live at: https://shopify-order-export.pages.dev${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📝 Don't forget to set environment variables in Cloudflare Dashboard:${NC}"
echo "  - DATABASE_URL"
echo "  - DATABASE_AUTH_TOKEN"
echo "  - SHOPIFY_STORE_DOMAIN"
echo "  - SHOPIFY_ACCESS_TOKEN"
echo "  - SHOPIFY_API_VERSION"
echo "  - AUTH_SECRET"
echo "  - NEXT_PUBLIC_APP_URL"
