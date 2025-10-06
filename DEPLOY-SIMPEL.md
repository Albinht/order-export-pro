# 🚀 SUPER SIMPELE VERCEL DEPLOYMENT

## ✨ Deploy in 2 minuten - GEEN DATABASE SETUP NODIG!

### 📋 Stap 1: Klik deze link
**[👉 KLIK HIER OM TE DEPLOYEN](https://vercel.com/new/clone?repository-url=https://github.com/Albinht/order-export-pro)**

### 📝 Stap 2: Vul deze 2 velden in:

Wanneer Vercel vraagt om "Environment Variables", kopieer dit:

```env
# Database - NIET VERANDEREN! Werkt automatisch
DATABASE_URL=file:./prisma/database.db

# Shopify - ALLEEN DIT AANPASSEN
SHOPIFY_STORE_DOMAIN=malen-nach-zahlen-experte.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_[PLAK HIER JE TOKEN]
SHOPIFY_API_VERSION=2025-01

# Security - NIET VERANDEREN! 
AUTH_SECRET=xK9mN3pQ7vB2wF5zL8hG4jR6tY1sD0aE
```

**⚠️ BELANGRIJK: Vervang alleen `[PLAK HIER JE TOKEN]` met jouw Shopify token!**

### ✅ Stap 3: Deploy
Klik op **"Deploy"** en wacht 2-3 minuten

### 🔑 Stap 4: Login
- **URL:** `https://[jouw-app-naam].vercel.app`
- **Username:** `admin`
- **Password:** `1n$$2O%n2$f2`

## 🎉 KLAAR!

### 🔥 Wat werkt er allemaal automatisch?
- ✅ Database wordt automatisch aangemaakt
- ✅ Geen externe database nodig (SQLite)
- ✅ Shopify store wordt automatisch toegevoegd
- ✅ Admin user wordt automatisch aangemaakt
- ✅ Alles werkt direct na deployment

### 🏪 Extra stores toevoegen?
1. Login op je app
2. Ga naar "Stores" 
3. Klik "Add Store"
4. Vul de gegevens in

### ❓ Problemen?
**Database error?** → Deploy opnieuw, wordt automatisch gefixed
**Login werkt niet?** → Check of AUTH_SECRET exact hetzelfde is
**Orders laden niet?** → Check je Shopify token

## 📱 WooCommerce Store Toevoegen

Na deployment, in de app:
1. Dashboard → Stores → Add Store
2. Platform: WooCommerce
3. Domain: jouw-store.nl
4. Consumer Key & Secret van WooCommerce

---

**💡 TIP:** Als je de deployment URL kwijt bent, check je email of ga naar https://vercel.com/dashboard
