# 🚀 Cloudflare Pages Deployment - FIXED & WERKEND

## ✅ Wat is er gefixt?
- **Edge Runtime Compatibiliteit**: Middleware werkt nu met Cloudflare's edge runtime
- **Database Setup**: Turso LibSQL integratie voor Cloudflare
- **Build Process**: Juiste build configuratie zonder deprecated packages
- **Prisma Edge Support**: Werkt nu met driver adapters voor edge runtime

## 📋 Complete Deployment Stappen

### Stap 1: Turso Database Setup (5 min)
```bash
# 1. Ga naar https://turso.tech en maak gratis account
# 2. Of gebruik de CLI:
curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup  # Of turso auth login als je al een account hebt

# 3. Maak database aan
turso db create shopify-orders --location ams  # Amsterdam voor lage latency
turso db show shopify-orders --url  # Kopieer deze URL!
turso db tokens create shopify-orders  # Kopieer dit token!
```

**Bewaar deze credentials:**
```
DATABASE_URL=libsql://shopify-orders-[username].turso.io
DATABASE_AUTH_TOKEN=eyJhbGc...  # Je auth token
```

### Stap 2: Database Schema Push
```bash
# Maak .env.production.local met je Turso credentials
cat > .env.production.local << 'EOF'
DATABASE_URL=libsql://shopify-orders-[username].turso.io
DATABASE_AUTH_TOKEN=[je-turso-token]
EOF

# Push schema naar Turso
npm run db:push
```

### Stap 3: Git Repository Setup
```bash
# Init git als nog niet gedaan
git init
git add .
git commit -m "Ready for Cloudflare deployment with fixes"

# Push naar GitHub
gh repo create shopify-order-export --public --source=. --remote=origin --push
# Of maak handmatig een repo op github.com
```

### Stap 4: Deploy op Cloudflare Pages

#### Via Cloudflare Dashboard (Aanbevolen):

1. **Login op [dash.cloudflare.com](https://dash.cloudflare.com)**

2. **Ga naar Workers & Pages → Create application → Pages**

3. **Connect to Git → Selecteer je GitHub repo**

4. **Build settings:**
   ```
   Framework preset: None
   Build command: npm run build:cloudflare
   Build output directory: .next
   Root directory: /shopify-order-export (als het in een subdir staat)
   Node version: 18 of hoger
   ```

5. **Environment variables toevoegen (BELANGRIJK!):**
   ```
   # Database (Turso)
   DATABASE_URL = libsql://shopify-orders-[username].turso.io
   DATABASE_AUTH_TOKEN = [je-turso-token]
   
   # Shopify
   SHOPIFY_STORE_DOMAIN = malen-nach-zahlen-experte.myshopify.com
   SHOPIFY_ACCESS_TOKEN = shpat_[je-token]
   SHOPIFY_API_VERSION = 2025-01
   
   # Auth (genereer: openssl rand -base64 32)
   AUTH_SECRET = [32-karakter-random-string]
   
   # App URL
   NEXT_PUBLIC_APP_URL = https://[project-name].pages.dev
   ```

6. **Compatibility settings toevoegen:**
   - Ga naar Settings → Functions
   - Compatibility flags: `nodejs_compat`
   - Compatibility date: `2024-01-01`

7. **Save and Deploy!**

#### Via CLI (Alternatief):
```bash
# Login bij Cloudflare
npx wrangler login

# Deploy direct
npx wrangler pages deploy .next \
  --project-name=shopify-order-export \
  --compatibility-date=2024-01-01 \
  --compatibility-flags=nodejs_compat

# Set environment variables via CLI
npx wrangler pages secret put DATABASE_URL --project-name=shopify-order-export
npx wrangler pages secret put DATABASE_AUTH_TOKEN --project-name=shopify-order-export
# etc...
```

### Stap 5: Setup Users
Update `/lib/simple-auth.ts` met je users:

```javascript
import bcrypt from 'bcryptjs';

// Genereer password hashes
const password1Hash = bcrypt.hashSync('JOUW_WACHTWOORD', 10);
const password2Hash = bcrypt.hashSync('TWEEDE_WACHTWOORD', 10);

console.log('User 1 hash:', password1Hash);
console.log('User 2 hash:', password2Hash);
```

Update dan in de code:
```javascript
const USERS = {
  admin: {
    username: 'admin',
    passwordHash: '[hash-van-boven]'
  },
  user2: {
    username: 'user2',
    passwordHash: '[hash-van-boven]'
  }
};
```

### Stap 6: Test de Deployment

1. **Check build logs in Cloudflare Dashboard**
2. **Open je app:** `https://[project-name].pages.dev`
3. **Test login met je geconfigureerde users**
4. **Test Shopify connectie**

## 🔧 Troubleshooting

### Build faalt?
```bash
# Check Node version (moet 18+)
node --version

# Clear cache en rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build:cloudflare
```

### Database connection error?
```bash
# Test Turso connection lokaal
npx turso db shell shopify-orders
.tables  # Moet je tabellen tonen

# Check tokens
turso db tokens create shopify-orders --expiration none
```

### Middleware errors?
- Check Cloudflare logs: Dashboard → Functions → Real-time logs
- Zorg dat compatibility flags zijn ingesteld: `nodejs_compat`

### Auth werkt niet?
- AUTH_SECRET moet exact 32+ karakters zijn
- Cookies werken alleen over HTTPS (automatisch op Cloudflare)
- Check browser console voor errors

## 📦 Wat werkt nu?

✅ **Edge-compatible middleware** - Geen Node.js dependencies meer
✅ **Turso database** - Werkt perfect met Cloudflare's edge runtime  
✅ **Prisma met adapters** - LibSQL adapter voor edge compatibility
✅ **Proper auth flow** - Cookies werken correct in productie
✅ **API routes** - Alle endpoints werken in edge runtime

## 💰 Kosten

| Service | Gratis Limiet | Kosten daarna |
|---------|---------------|---------------|
| Cloudflare Pages | Unlimited | €0 |
| Turso Database | 8GB, 1B reads/maand | €29/maand |
| Custom Domain | - | €10/jaar (optioneel) |

**Voor 2 users:** Alles blijft binnen gratis limieten! 🎉

## 🚀 Next Steps

1. **Custom domain toevoegen:**
   - Cloudflare Dashboard → Custom domains → Add
   - CNAME: `orders.jouwdomein.nl` → `[project].pages.dev`

2. **Monitoring toevoegen:**
   - Cloudflare Analytics is automatisch enabled
   - Real-time logs in Functions tab

3. **Auto-deploy bij git push:**
   - Dit is al automatisch geconfigureerd!
   - Elke push naar main = nieuwe deployment

## 📝 Environment Variables Checklist

Zorg dat deze ALLEMAAL zijn ingesteld in Cloudflare:

- [ ] `DATABASE_URL` - Turso database URL
- [ ] `DATABASE_AUTH_TOKEN` - Turso auth token  
- [ ] `SHOPIFY_STORE_DOMAIN` - Je .myshopify.com domain
- [ ] `SHOPIFY_ACCESS_TOKEN` - shpat_ token van Shopify
- [ ] `SHOPIFY_API_VERSION` - 2025-01
- [ ] `AUTH_SECRET` - Random 32+ char string
- [ ] `NEXT_PUBLIC_APP_URL` - https://[project].pages.dev

## ✅ Deployment Compleet!

Je app draait nu volledig op Cloudflare's edge network:
- **Super snel** wereldwijd
- **100% gratis** voor kleine apps
- **Automatische HTTPS**
- **Git-based deployments**

Problemen? Check de Cloudflare Functions logs voor details!
