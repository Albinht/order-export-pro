# 🚀 Cloudflare Pages Deployment - 100% GRATIS

## ✅ Waarom Cloudflare Pages?
- **€0/maand** voor unlimited gebruik
- **Super snel** met global CDN
- **Automatic HTTPS** 
- **Git integration** voor auto-deploy
- **Perfect voor 2 gebruikers**

## 📋 Stap-voor-Stap Guide (15 minuten)

### Stap 1: Database Setup met Turso (5 min)
```bash
# Turso = SQLite in the cloud, GRATIS!
# 1. Ga naar https://turso.tech en maak account
# 2. Of gebruik CLI:

curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup  # Of login
turso db create order-export
turso db show order-export --url  # Kopieer deze URL!
turso db tokens create order-export  # Kopieer token!
```

**Je krijgt:**
- Database URL: `libsql://order-export-[username].turso.io`
- Auth Token: `eyJhbGc...` (lang token)

### Stap 2: Code naar GitHub (3 min)
```bash
cd /Users/al/shoify_order_export/shopify-order-export

# Init git
git init
git add .
git commit -m "Initial commit for Cloudflare"

# Push naar GitHub
gh repo create order-export --public --source=. --remote=origin --push
# Of manual: maak repo op github.com en push
```

### Stap 3: Deploy op Cloudflare Pages (7 min)

1. **Ga naar [dash.cloudflare.com](https://dash.cloudflare.com)**
2. **Workers & Pages → Create application → Pages**
3. **Connect to Git → Selecteer je GitHub repo**

4. **Build settings:**
   ```
   Framework preset: None
   Build command: npm run build:cloudflare
   Build output directory: .vercel/output/static
   ```

5. **Environment variables (BELANGRIJK!):**
   ```
   DATABASE_URL = libsql://order-export-[username].turso.io
   DATABASE_AUTH_TOKEN = [je-turso-token]
   
   SHOPIFY_STORE_DOMAIN = malen-nach-zahlen-experte.myshopify.com
   SHOPIFY_ACCESS_TOKEN = shpat_your_access_token_here
   SHOPIFY_API_VERSION = 2025-01
   
   AUTH_SECRET = [random-string-32-chars]
   ```

6. **Save and Deploy!**

### Stap 4: Database Setup (2 min)
```bash
# Na eerste deployment, setup database:
npm install -D @cloudflare/workers-types wrangler

# Maak .env.production.local met je Turso credentials
echo "DATABASE_URL=libsql://..." > .env.production.local
echo "DATABASE_AUTH_TOKEN=..." >> .env.production.local

# Run migrations
npx prisma migrate deploy
```

## 🎯 Klaar! Je app draait nu op:

```
https://order-export.pages.dev
```

Of met custom domain:
```
https://orders.jouw-domein.nl
```

## 🔧 Custom Domain (Optioneel)

1. Cloudflare Dashboard → Pages → je project
2. Custom domains → Add domain
3. Voeg CNAME record toe:
   ```
   CNAME orders -> order-export.pages.dev
   ```

## 👥 Users Setup

Voor de 2 gebruikers, update `/lib/simple-auth.ts`:

```javascript
const USERS = {
  admin: {
    username: 'admin',
    passwordHash: '$2a$10$...' // bcrypt.hashSync('JOUW_WACHTWOORD', 10)
  },
  user2: {
    username: 'user2', 
    passwordHash: '$2a$10$...' // bcrypt.hashSync('ANDER_WACHTWOORD', 10)
  }
};
```

## 🚨 Troubleshooting

**Build fails?**
```bash
npm install @cloudflare/next-on-pages
```

**Database connection fails?**
- Check Turso token is geldig
- Database URL moet beginnen met `libsql://`

**Auth not working?**
- AUTH_SECRET moet minstens 32 karakters zijn
- Cookies werken alleen over HTTPS in productie

## 💰 Kosten Overzicht

| Service | Kosten | Limiet |
|---------|--------|--------|
| Cloudflare Pages | €0 | Unlimited |
| Turso Database | €0 | 8GB storage, 1B reads |
| Custom Domain | €10/jaar | Optioneel |
| **TOTAAL** | **€0/maand** | Perfect voor 2 users |

## 🎉 That's it!

Je app is nu:
- ✅ Online en veilig
- ✅ Super snel wereldwijd
- ✅ 100% gratis
- ✅ Auto-deploy bij git push
- ✅ HTTPS encrypted

Geen servers, geen gedoe, gewoon werkt! 🚀
