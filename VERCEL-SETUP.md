# 🚀 Vercel Deployment - Werkende Setup

## ✅ Stap 1: Deploy naar Vercel

1. Ga naar [vercel.com/new](https://vercel.com/new)
2. Importeer repository: `https://github.com/Albinht/order-export-pro`
3. **Build Command**: `npm run build:vercel` (wordt automatisch ingesteld via vercel.json)
4. **Install Command**: `npm install`

## 🔐 Stap 2: Environment Variables Toevoegen

Ga naar **Settings** → **Environment Variables** in je Vercel project.

Voeg deze variables toe (waarden staan in `CREDENTIALS.local.md`):

### Database (Turso)
```
DATABASE_URL = libsql://order-export-db-albinht.aws-ap-northeast-1.turso.io
DATABASE_AUTH_TOKEN = [zie CREDENTIALS.local.md]
```

### Shopify Stores
```
SHOPIFY_TOKEN_MALEN = [zie CREDENTIALS.local.md]
SHOPIFY_TOKEN_PAINTING = [zie CREDENTIALS.local.md]
SHOPIFY_API_VERSION = 2025-01
```

### Authentication
```
AUTH_SECRET = [zie CREDENTIALS.local.md]
```

### App URL
```
NEXT_PUBLIC_APP_URL = https://[jouw-vercel-url].vercel.app
```

⚠️ **LET OP**: Zorg dat je deze variables instelt voor:
- ✅ Production
- ✅ Preview  
- ✅ Development

## 🎯 Stap 3: Redeploy

Na het toevoegen van environment variables:
1. Ga naar **Deployments**
2. Klik op de laatste deployment
3. Klik **Redeploy** → **Use existing Build Cache: No**

## ✅ Stap 4: Test de Applicatie

1. Open je Vercel URL: `https://[jouw-project].vercel.app`
2. De app zou moeten laden
3. Beide stores worden automatisch aangemaakt bij de eerste request!

## 🔧 Troubleshooting

### Error: URL_INVALID: The URL 'undefined' is not in a valid format

**Oorzaak**: DATABASE_URL is niet ingesteld in Vercel environment variables

**Oplossing**:
1. Ga naar Settings → Environment Variables
2. Voeg `DATABASE_URL` toe met de Turso URL
3. Voeg `DATABASE_AUTH_TOKEN` toe
4. Redeploy de applicatie

### Stores worden niet aangemaakt

**Oorzaak**: Shopify tokens niet ingesteld

**Oplossing**:
1. Check of `SHOPIFY_TOKEN_MALEN` is ingesteld
2. Check of `SHOPIFY_TOKEN_PAINTING` is ingesteld
3. Redeploy

### Build fails

**Oorzaak**: Oude build cache

**Oplossing**:
1. Ga naar Deployments
2. Klik op **... Menu** → **Redeploy**
3. **Selecteer**: Use existing Build Cache: **No**

## 📝 Checklist

- [ ] Repository geïmporteerd in Vercel
- [ ] `DATABASE_URL` toegevoegd (Turso)
- [ ] `DATABASE_AUTH_TOKEN` toegevoegd
- [ ] `SHOPIFY_TOKEN_MALEN` toegevoegd
- [ ] `SHOPIFY_TOKEN_PAINTING` toegevoegd
- [ ] `SHOPIFY_API_VERSION` ingesteld op `2025-01`
- [ ] `AUTH_SECRET` toegevoegd
- [ ] `NEXT_PUBLIC_APP_URL` ingesteld
- [ ] Eerste deployment succesvol
- [ ] App werkt en stores zijn beschikbaar

## 🎉 Klaar!

Je applicatie draait nu op Vercel met beide Shopify stores!

**Vercel URL**: https://[jouw-project].vercel.app

Beide stores zijn automatisch beschikbaar:
- ✅ Malen Nach Zahlen Experte
- ✅ Painting Expert
