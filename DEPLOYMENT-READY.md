# ✅ KLAAR VOOR CLOUDFLARE DEPLOYMENT!

## 🎉 Wat is er gedaan:
1. ✅ **Turso Database opgezet** - Alle tabellen aangemaakt
2. ✅ **Credentials geconfigureerd** - Database, Shopify, Auth alles klaar
3. ✅ **Default store aangemaakt** - Malen Nach Zahlen Experte store
4. ✅ **Edge runtime compatible** - Middleware en Prisma werken met Cloudflare

## 📋 Je Credentials (bewaar deze veilig!):
```env
DATABASE_URL=libsql://order-export-db-albinht.aws-ap-northeast-1.turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOi....[je token]
SHOPIFY_ACCESS_TOKEN=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
AUTH_SECRET=9XBFYlKIcCIHSM2oXGYICcCTfne7fst872TlP8M55Dw=
```

## 🚀 Deploy naar Cloudflare - 2 Opties:

### Optie 1: Via GitHub + Cloudflare Dashboard (AANBEVOLEN)

```bash
# 1. Push code naar GitHub
git add .
git commit -m "Ready for Cloudflare deployment with Turso"
git push origin main

# 2. Ga naar https://dash.cloudflare.com
# 3. Workers & Pages → Create application → Pages
# 4. Connect je GitHub repo
```

**Build Settings in Cloudflare:**
- Build command: `npm run build:cloudflare`  
- Build output directory: `.next`
- Node version: `18`

**Environment Variables (ALLE toevoegen!):**
```
DATABASE_URL = libsql://order-export-db-albinht.aws-ap-northeast-1.turso.io
DATABASE_AUTH_TOKEN = [plak hier je volledige token]
SHOPIFY_STORE_DOMAIN = malen-nach-zahlen-experte.myshopify.com
SHOPIFY_ACCESS_TOKEN = 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
SHOPIFY_API_VERSION = 2025-01
AUTH_SECRET = 9XBFYlKIcCIHSM2oXGYICcCTfne7fst872TlP8M55Dw=
NEXT_PUBLIC_APP_URL = https://[jouw-project].pages.dev
```

**Compatibility Settings:**
- Functions → Compatibility flags: `nodejs_compat`
- Compatibility date: `2024-01-01`

### Optie 2: Direct via CLI

```bash
# Login bij Cloudflare
npx wrangler login

# Build het project
npm run build:cloudflare

# Deploy
npx wrangler pages deploy .next \
  --project-name=shopify-order-export \
  --compatibility-date=2024-01-01 \
  --compatibility-flags=nodejs_compat

# Set secrets (één voor één)
npx wrangler pages secret put DATABASE_URL --project-name=shopify-order-export
npx wrangler pages secret put DATABASE_AUTH_TOKEN --project-name=shopify-order-export
npx wrangler pages secret put SHOPIFY_ACCESS_TOKEN --project-name=shopify-order-export
npx wrangler pages secret put AUTH_SECRET --project-name=shopify-order-export
# etc...
```

## 🔐 Users Setup

Voor de login moet je nog gebruikers aanmaken. Update `/lib/simple-auth.ts`:

```javascript
// Genereer password hashes:
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('JOUW_WACHTWOORD', 10));
```

En update de USERS constant met je hashes.

## ✅ Checklist voor Deployment:

- [ ] GitHub repo aangemaakt
- [ ] Code gepusht naar GitHub  
- [ ] Cloudflare Pages project aangemaakt
- [ ] GitHub repo connected
- [ ] Build settings geconfigureerd
- [ ] ALLE environment variables toegevoegd
- [ ] Compatibility flags ingesteld
- [ ] Deploy gestart

## 🌐 Na Deployment:

Je app draait dan op:
```
https://[project-name].pages.dev
```

Test:
1. Open de URL
2. Login met je geconfigureerde users
3. Check of Shopify orders laden

## 🆘 Troubleshooting:

**Build faalt?**
- Check Node version (moet 18+)
- Check of alle environment variables zijn ingesteld
- Check Cloudflare Functions logs

**Database error?**
- Verifieer DATABASE_URL en DATABASE_AUTH_TOKEN
- Check of compatibility flags zijn ingesteld

**Auth werkt niet?**
- AUTH_SECRET moet exact dezelfde zijn
- Check browser cookies
- HTTPS is vereist in productie

## 📊 Monitoring:

Na deployment kun je in Cloudflare Dashboard:
- Real-time logs bekijken
- Analytics checken
- Errors debuggen

## 🎯 Succes!

Je hebt nu:
- ✅ Gratis hosting op Cloudflare's edge network
- ✅ Database in de cloud (Turso)
- ✅ Shopify integratie werkend
- ✅ Veilige authenticatie
- ✅ Wereldwijde performance

**Problemen? Check de Cloudflare Functions logs voor details!**
