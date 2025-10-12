#!/bin/bash

echo "🚀 Quick Deploy Script voor Shopify Order Export"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Waar wil je deployen?${NC}"
echo "1) Vercel (AANBEVOLEN - Werkt direct!)"
echo "2) Cloudflare Pages"
echo "3) Lokaal testen"
read -p "Kies (1/2/3): " choice

case $choice in
  1)
    echo -e "${GREEN}🚀 Deploying naar Vercel...${NC}"
    
    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
      echo "Installing Vercel CLI..."
      npm i -g vercel
    fi
    
    # Create .env for Vercel
    cat > .env.production << 'EOF'
DATABASE_URL=file:./prisma/database.db
SHOPIFY_STORE_DOMAIN=malen-nach-zahlen-experte.myshopify.com
SHOPIFY_ACCESS_TOKEN=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
SHOPIFY_API_VERSION=2025-01
AUTH_SECRET=9XBFYlKIcCIHSM2oXGYICcCTfne7fst872TlP8M55Dw=
EOF
    
    echo -e "${YELLOW}Login bij Vercel...${NC}"
    vercel login
    
    echo -e "${GREEN}Deploying...${NC}"
    vercel --prod
    
    echo -e "${GREEN}✅ KLAAR! Je app is live!${NC}"
    ;;
    
  2)
    echo -e "${GREEN}🚀 Deploying naar Cloudflare Pages...${NC}"
    
    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
      echo "Installing Wrangler CLI..."
      npm i -g wrangler
    fi
    
    echo -e "${YELLOW}Login bij Cloudflare...${NC}"
    wrangler login
    
    echo -e "${YELLOW}Building project...${NC}"
    npm run build:cloudflare
    
    echo -e "${YELLOW}Project naam (bv: shopify-orders):${NC}"
    read -p "Naam: " project_name
    
    echo -e "${GREEN}Creating project and deploying...${NC}"
    wrangler pages project create $project_name --production-branch main 2>/dev/null || true
    wrangler pages deploy .next --project-name=$project_name
    
    echo -e "${GREEN}✅ Je app is live op: https://$project_name.pages.dev${NC}"
    echo -e "${YELLOW}⚠️  Vergeet niet environment variables toe te voegen in Cloudflare Dashboard!${NC}"
    ;;
    
  3)
    echo -e "${GREEN}🏠 Starting lokale server...${NC}"
    npm run dev
    ;;
    
  *)
    echo -e "${RED}Ongeldige keuze${NC}"
    exit 1
    ;;
esac
