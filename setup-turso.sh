#!/bin/bash

echo "🚀 Turso Database Setup"
echo "======================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Je Turso database URL:${NC}"
echo "libsql://order-export-db-albinht.aws-ap-northeast-1.turso.io"
echo ""

echo -e "${YELLOW}📝 Om je AUTH TOKEN op te halen, voer dit commando uit:${NC}"
echo -e "${GREEN}turso db tokens create order-export-db-albinht${NC}"
echo ""

echo "Of als je nog niet ingelogd bent:"
echo -e "${GREEN}turso auth login${NC}"
echo -e "${GREEN}turso db tokens create order-export-db-albinht${NC}"
echo ""

echo -e "${YELLOW}Nadat je het token hebt:${NC}"
echo "1. Open .env.production.local"
echo "2. Vervang YOUR_TURSO_AUTH_TOKEN_HERE met je token"
echo "3. Run: npm run db:push"
echo ""

echo -e "${CYAN}Test commando's:${NC}"
echo "# Test lokaal met Turso:"
echo "npm run dev"
echo ""
echo "# Push database schema naar Turso:"
echo "npm run db:push"
echo ""
echo "# Deploy naar Cloudflare:"
echo "./deploy-cloudflare.sh"
