# 🚨 BELANGRIJK: Cloudflare Pages Settings

## ⚠️ JE MOET DEZE SETTINGS GEBRUIKEN IN CLOUDFLARE DASHBOARD:

### Build Configuration (EXACT zo invullen!):
```
Build command: npm run build:cloudflare
Build output directory: .next
Root directory: (leeg laten)
```

### Environment Variables (ALLE toevoegen):
```
NODE_VERSION = 20.18.0
NODE_ENV = production
DATABASE_URL = file:./dummy.db

SHOPIFY_STORE_DOMAIN = malen-nach-zahlen-experte.myshopify.com
SHOPIFY_ACCESS_TOKEN = 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
SHOPIFY_API_VERSION = 2025-01

AUTH_SECRET = 9XBFYlKIcCIHSM2oXGYICcCTfne7fst872TlP8M55Dw=
NEXT_PUBLIC_APP_URL = https://shopify-order-export.pages.dev
```

## 📝 STAPPEN:

1. **Cancel huidige deployment** als die nog loopt

2. **Ga naar Settings → Builds & deployments**

3. **Update Build Configuration:**
   - Build command: `npm run build:cloudflare` (NIET `npm run build`!)
   - Build output directory: `.next` (NIET `.vercel/output/static`!)
   
4. **Update Environment Variables** (allemaal toevoegen!)

5. **Retry deployment** of wacht op automatische rebuild

## ❌ NIET DEZE FOUTEN MAKEN:
- ❌ NIET `npm run build` gebruiken
- ❌ NIET `.vercel/output/static` als output directory
- ❌ NIET vergeten DATABASE_URL toe te voegen
- ❌ NIET NODE_VERSION vergeten

## ✅ JUISTE SETTINGS:
- ✅ Build command: `npm run build:cloudflare`
- ✅ Build output: `.next`
- ✅ NODE_VERSION: `20.18.0`
- ✅ DATABASE_URL: `file:./dummy.db` (voor build)

## 🔄 Als het nog steeds niet werkt:

1. Clear build cache:
   - Settings → Clear build cache
   
2. Retry deployment met deze EXACTE settings

3. Check build logs voor errors

## 🎯 Het MOET nu werken!
