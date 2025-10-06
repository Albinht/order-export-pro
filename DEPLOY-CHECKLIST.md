# ✅ Deployment Checklist voor Cloudflare Pages

## 🚀 Quick Deploy (15 minuten)

### 1️⃣ Database Setup (Turso)
- [ ] Account aanmaken op [turso.tech](https://turso.tech)
- [ ] Database aanmaken: `order-export`
- [ ] Connection URL gekopieerd
- [ ] Auth token gekopieerd

### 2️⃣ GitHub Repository
- [ ] Code gepusht naar GitHub
```bash
git add .
git commit -m "Ready for Cloudflare deployment"
git push origin main
```

### 3️⃣ Cloudflare Pages Setup
- [ ] Ingelogd op [dash.cloudflare.com](https://dash.cloudflare.com)
- [ ] Workers & Pages → Create → Pages
- [ ] GitHub repo connected
- [ ] Build settings:
  - Build command: `npm run build:cloudflare`
  - Output directory: `.vercel/output/static`
  - Node version: `18`

### 4️⃣ Environment Variables (BELANGRIJK!)
Voeg deze toe in Cloudflare Dashboard:

- [ ] `DATABASE_URL` = `libsql://[database-name].turso.io`
- [ ] `DATABASE_AUTH_TOKEN` = `[turso-token]`
- [ ] `SHOPIFY_STORE_DOMAIN` = `malen-nach-zahlen-experte.myshopify.com`
- [ ] `SHOPIFY_ACCESS_TOKEN` = `shpat_your_access_token_here`
- [ ] `AUTH_SECRET` = `[32-char-random-string]`

### 5️⃣ Deploy & Test
- [ ] Deploy button geklikt
- [ ] Build succesvol (± 2-3 minuten)
- [ ] Site accessible op `https://[project].pages.dev`
- [ ] Login werkt met `admin` / `1n$$2O%n2$f2`
- [ ] Orders laden correct
- [ ] Export werkt

## 🔧 Optional: Custom Domain
- [ ] Custom domain toegevoegd in Cloudflare
- [ ] DNS records configured
- [ ] SSL certificaat actief

## 📝 Post-Deployment
- [ ] Wachtwoorden aangepast in `/lib/simple-auth.ts`
- [ ] Test export functionaliteit
- [ ] Bookmark de URL voor gebruikers

## 🚨 Troubleshooting

**Build fails?**
- Check Node version is 18+
- Probeer: `npm install --legacy-peer-deps`

**Database connection error?**
- Turso URL moet beginnen met `libsql://`
- Auth token moet volledig zijn (lang token)

**Login werkt niet?**
- AUTH_SECRET moet exact 32 karakters zijn
- Check cookies enabled in browser

## 🎉 Success!
Je app draait nu gratis op Cloudflare's global network:
- ⚡ Super snel (< 50ms latency)
- 🔒 Automatic HTTPS
- 🌍 Global CDN
- 💰 €0/maand kosten
- 🚀 Auto-deploy bij git push
