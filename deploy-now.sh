#!/bin/bash

echo "🚀 VERCEL DEPLOYMENT HELPER"
echo "=========================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo "✅ Vercel CLI is ready"
echo ""
echo "🔧 Setting up environment variables..."
echo ""

# Create .env file for Vercel
cat > .env.production << 'EOF'
SHOPIFY_STORE_DOMAIN=malen-nach-zahlen-experte.myshopify.com
SHOPIFY_ACCESS_TOKEN=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
SHOPIFY_API_VERSION=2025-01
AUTH_SECRET=9XBFYlKIcCIHSM2oXGYICcCTfne7fst872TlP8M55Dw=
NEXT_PUBLIC_APP_URL=https://order-export-pro.vercel.app
EOF

echo "✅ Environment variables configured"
echo ""
echo "🎯 Starting deployment..."
echo ""
echo "IMPORTANT: When prompted:"
echo "1. Login with your Vercel account (if needed)"
echo "2. Link to existing project? Answer: No"
echo "3. What's your project name? Press ENTER (use default)"
echo "4. In which directory is your code? Press ENTER (.)"
echo "5. Want to override settings? Answer: No"
echo ""
echo "Press ENTER to start deployment..."
read

# Deploy with Vercel
vercel --prod

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🎉 Your app should now be live!"
echo ""
echo "📝 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🔗 Visit your app at the URL shown above!"
echo ""
echo "💡 TIP: To add multi-store support, check VERCEL-KV-SETUP.md"
