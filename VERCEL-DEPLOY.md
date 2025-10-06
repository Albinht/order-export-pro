# 🚀 Vercel Deployment Guide (Makkelijkste optie!)

Vercel is de makkelijkste manier om deze Next.js app te deployen omdat het native Next.js support heeft.

## ✅ Stap 1: Deploy naar Vercel

1. **Ga naar:** https://vercel.com/new
2. **Import Git Repository**
3. **Selecteer:** `Albinht/order-export-pro`
4. **Framework Preset:** Next.js (auto-detected)
5. **Build Command:** `prisma generate && next build`
6. **Output Directory:** `.next` (default)

## ✅ Stap 2: Database Setup (Kies één)

### Optie A: Turso (Aanbevolen - Gratis)
1. **Ga naar:** https://turso.tech
2. **Sign up** (gratis)
3. **Maak database:**
   ```bash
   turso db create order-export
   turso db tokens create order-export
   ```

### Optie B: Neon PostgreSQL (Ook gratis)
1. **Ga naar:** https://neon.tech
2. **Create project**
3. **Copy connection string**

### Optie C: SQLite File (Simpelste)
Gebruik: `DATABASE_URL=file:./database.db`

## ✅ Stap 3: Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```env
# Database (gebruik één van deze)
DATABASE_URL=libsql://[database].turso.io
DATABASE_AUTH_TOKEN=[turso-token]
# OF
DATABASE_URL=postgresql://[neon-connection-string]
# OF  
DATABASE_URL=file:./database.db

# Shopify Store 1
SHOPIFY_STORE_DOMAIN=malen-nach-zahlen-experte.myshopify.com
SHOPIFY_ACCESS_TOKEN=[jouw-shopify-token]
SHOPIFY_API_VERSION=2025-01

# Auth Secret (genereer met: openssl rand -base64 32)
AUTH_SECRET=[random-32-char-string]

# App URL
NEXT_PUBLIC_APP_URL=https://[jouw-app].vercel.app
```

## ✅ Stap 4: Deploy

1. Klik **Deploy**
2. Wacht 2-3 minuten
3. Klik **Continue to Dashboard**

## ✅ Stap 5: Database Initialiseren

Na deployment, run in Vercel terminal of lokaal:
```bash
npx prisma migrate deploy
```

## ✅ Stap 6: Login

- **URL:** https://[jouw-app].vercel.app
- **Username:** admin  
- **Password:** 1n$$2O%n2$f2

## 🎯 Klaar!

Je app draait nu op Vercel met:
- ✅ Automatische HTTPS
- ✅ Global CDN
- ✅ Automatische deploys bij git push
- ✅ Gratis voor personal use

## 📝 Extra Stores Toevoegen

Login → Dashboard → Stores → Add Store:
- Platform: Shopify / WooCommerce
- Domain: store.myshopify.com
- Access Token: shpat_xxxxx
- Voor WooCommerce: Consumer Key & Secret
