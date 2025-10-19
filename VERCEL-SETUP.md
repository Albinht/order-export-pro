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

### ✅ Stap 1: Test Health Check
Eerst test je of de applicatie draait:

**Open**: `https://[jouw-vercel-url].vercel.app/api/health`

**Verwachte response als alles OK is:**
```json
{
  "status": "ok",
  "message": "All systems operational",
  "database": { "connected": true, "type": "Turso" },
  "stores": { "count": 2, "list": [...] }
}
```

**Als je een error ziet, lees de response voor troubleshooting tips!**

---

### ❌ Error: Invalid prisma.store.create() invocation

**Symptoom**: "Error querying the database: Error code 14: Unable to open the database file"

**Oorzaak**: DATABASE_URL wijst naar een lokaal bestand in plaats van Turso

**Oplossing**:
1. Ga naar Vercel → Settings → Environment Variables
2. Check `DATABASE_URL` waarde - moet zijn: `libsql://order-export-db-albinht.aws-ap-northeast-1.turso.io`
3. Als je `file:./dummy.db` ziet → VERWIJDER deze en voeg correcte Turso URL toe
4. Check `DATABASE_AUTH_TOKEN` is ingesteld (zie `CREDENTIALS.local.md`)
5. **BELANGRIJK**: Zet variabelen voor Production, Preview EN Development
6. Redeploy zonder build cache

---

### ❌ Error: DATABASE_URL is not set

**Symptoom**: App crasht met "RUNTIME ERROR: DATABASE_URL is not set"

**Oplossing**:
1. Open `CREDENTIALS.local.md` (lokaal bestand)
2. Kopieer `DATABASE_URL` waarde
3. Ga naar Vercel → Settings → Environment Variables
4. Klik "Add" → Name: `DATABASE_URL`, Value: [gekopieerde waarde]
5. Selecteer: Production, Preview, Development (alle 3!)
6. Redeploy

---

### ❌ Error: DATABASE_AUTH_TOKEN is required

**Symptoom**: "RUNTIME ERROR: DATABASE_AUTH_TOKEN is required for Turso"

**Oplossing**:
1. Open `CREDENTIALS.local.md`
2. Kopieer `DATABASE_AUTH_TOKEN` waarde
3. Ga naar Vercel → Settings → Environment Variables
4. Voeg toe met alle 3 environments selected
5. Redeploy

---

### 🏪 Stores worden niet aangemaakt

**Symptoom**: Database werkt maar geen stores zichtbaar

**Oplossing**:
1. Check `/api/health` endpoint - kijk naar "missing" array
2. Voeg missende environment variables toe:
   - `SHOPIFY_TOKEN_MALEN`
   - `SHOPIFY_TOKEN_PAINTING`
   - `SHOPIFY_API_VERSION` (waarde: `2025-01`)
3. Waarden staan in `CREDENTIALS.local.md`
4. Redeploy

---

### 🔨 Build Fails

**Symptoom**: Build error tijdens deployment

**Oplossing**:
1. Ga naar Deployments
2. Klik op de failed deployment
3. Check build logs voor specifieke errors
4. **Als database errors tijdens build**: Dit is normaal! Build gebruikt dummy database
5. Klik **Redeploy** → **Use existing Build Cache: NO**

---

### 🚨 Complete Reset

Als niets werkt, volg deze stappen:

1. **Verwijder ALLE environment variables**
2. **Open `CREDENTIALS.local.md`**
3. **Voeg ALLE variables opnieuw toe:**
   ```
   DATABASE_URL = [kopieer uit CREDENTIALS.local.md]
   DATABASE_AUTH_TOKEN = [kopieer uit CREDENTIALS.local.md]
   SHOPIFY_TOKEN_MALEN = [kopieer uit CREDENTIALS.local.md]
   SHOPIFY_TOKEN_PAINTING = [kopieer uit CREDENTIALS.local.md]
   SHOPIFY_API_VERSION = 2025-01
   AUTH_SECRET = [kopieer uit CREDENTIALS.local.md]
   NEXT_PUBLIC_APP_URL = https://[jouw-vercel-url].vercel.app
   ```
4. **Selecteer voor ELKE variable: Production ✓ Preview ✓ Development ✓**
5. **Redeploy zonder build cache**
6. **Test `/api/health`**

---

### 📊 Debug Checklist

- [ ] Vercel deployment succesvol (groene checkmark)
- [ ] Alle 7 environment variables toegevoegd
- [ ] Alle variables ingesteld voor Production, Preview, Development
- [ ] DATABASE_URL begint met `libsql://` (NIET `file:`)
- [ ] Geredeployed zonder build cache
- [ ] `/api/health` endpoint returnt `"status": "ok"`
- [ ] App URL werkt en toont login pagina

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
