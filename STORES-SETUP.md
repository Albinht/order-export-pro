# 🏪 Stores Setup - Multi-Store Configuration

## ✅ Geconfigureerde Stores

De applicatie is nu geconfigureerd met **2 Shopify stores** die automatisch beschikbaar zijn via environment variables:

### 1. Malen Nach Zahlen Experte
- **Domain**: `malen-nach-zahlen-experte.myshopify.com`
- **Platform**: Shopify
- **Status**: Actief ✅

### 2. Painting Expert  
- **Domain**: `painting-expert.myshopify.com`
- **Platform**: Shopify
- **Status**: Actief ✅

## 🚀 Hoe het werkt

### Lokale Development

1. **Database setup**:
   ```bash
   npx prisma migrate dev
   ```

2. **Seed beide stores**:
   ```bash
   npm run db:seed
   ```

3. **Verificatie**:
   ```bash
   node test-stores.js
   ```

4. **Start applicatie**:
   ```bash
   npm run dev
   ```

### Cloudflare/Vercel Deployment

De stores worden **automatisch** aangemaakt bij de eerste request via:
- `lib/store-manager.ts` → `ensureDefaultStore()` functie
- `lib/seed-store.ts` → `seedDefaultStore()` functie

Beide functies bevatten de hardcoded store credentials en creëren de stores als ze nog niet bestaan.

## 🔐 Store Credentials Locatie

De store credentials worden geconfigureerd via **environment variables**:

**`.env.local` (Development)**
```bash
SHOPIFY_TOKEN_MALEN=shpat_your_malen_token_here
SHOPIFY_TOKEN_PAINTING=shpat_your_painting_token_here
```

**`.env.production.local` (Production/Cloudflare)**
```bash
SHOPIFY_TOKEN_MALEN=shpat_your_malen_token_here
SHOPIFY_TOKEN_PAINTING=shpat_your_painting_token_here
```

**Store configuratie bestanden:**
1. **`lib/store-manager.ts`** - Automatische store seeding bij requests
2. **`lib/seed-store.ts`** - Seeding voor development
3. **`seed-stores.js`** - Manueel seed script

## 📝 Voordelen van deze setup

✅ **Veilige credentials** via environment variables  
✅ **Automatische setup** bij deployment  
✅ **Multi-store support** vanaf dag 1  
✅ **Eenvoudig te onderhouden** - configuratie gescheiden van code  
✅ **Geen handmatige database setup** nodig in productie  
✅ **GitHub push protection** geen probleem meer

## 🔄 Nieuwe store toevoegen

1. Voeg store configuratie toe aan `STORES_CONFIG` in:
   - `lib/store-manager.ts`
   - `lib/seed-store.ts`
   - `seed-stores.js`

2. Voeg environment variable toe:
   ```bash
   SHOPIFY_TOKEN_NEWSTORE=shpat_your_token_here
   ```

3. Voer `npm run db:seed` uit lokaal

4. Deploy naar productie met nieuwe environment variable

## ⚠️ Belangrijk

- Access tokens staan in **environment variables** (niet in git)
- Voeg `.env.local` en `.env.production.local` toe aan `.gitignore`
- Zet environment variables in Cloudflare/Vercel dashboard
- Roteer tokens regelmatig voor security

## 🧪 Test Commands

```bash
# Test stores in database
node test-stores.js

# Seed stores opnieuw
npm run db:seed

# Check database inhoud
npx prisma studio
```

## 📱 Store Management UI

Na deployment kunnen stores beheerd worden via:
- **Dashboard**: `/stores`
- **Admin Panel**: `/admin/stores` (indien toegang)

Beide hardcoded stores zijn direct beschikbaar en actief!
