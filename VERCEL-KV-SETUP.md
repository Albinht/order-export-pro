# 🔧 Vercel KV Setup (OPTIONEEL - Voor Multi-Store Support)

## ✅ De app werkt ZONDER dit!
De app werkt al volledig met één Shopify store via environment variables. 
Dit is alleen nodig als je **meerdere stores** wilt toevoegen vanuit de UI.

## 🎯 Wat is Vercel KV?
- Gratis Redis database van Vercel
- Perfect voor kleine data zoals store configuraties
- 30MB gratis storage
- Geen credit card nodig

## 📝 Setup Stappen (2 minuten):

### 1. Open je Vercel Project Dashboard
Ga naar je gedeployde project op Vercel

### 2. Ga naar Storage Tab
Klik op **"Storage"** in de sidebar

### 3. Maak KV Database
1. Klik **"Create Database"**
2. Kies **"KV"** 
3. Geef het een naam (bijv. `order-export-stores`)
4. Kies de regio dichtbij je (bijv. `ams` voor Amsterdam)
5. Klik **"Create"**

### 4. Connect Database
Vercel voegt automatisch deze environment variables toe:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 5. Redeploy
1. Ga naar **"Deployments"** tab
2. Klik **"Redeploy"** bij de laatste deployment
3. Wacht 1-2 minuten

## ✅ Klaar!

Nu kun je:
- **Meerdere stores toevoegen** vanuit de UI
- **Wisselen tussen stores** met de dropdown
- **Store credentials opslaan** veilig in Vercel KV

## 🚀 Hoe stores toevoegen:

1. Login op je app
2. Klik op **"+ Add Store"** in de store selector
3. Vul in:
   - **Store Name**: Bijv. "Mijn Shopify Store"
   - **Domain**: `jouw-store.myshopify.com`
   - **Access Token**: `shpat_xxxxx`
4. Klik **"Add Store"**

## 💡 Zonder Vercel KV:
Als je geen Vercel KV setup doet:
- App gebruikt in-memory storage
- Stores worden niet permanent opgeslagen
- Bij elke deployment begin je opnieuw
- **Dit is prima voor 1 store!** (gebruik gewoon env vars)

## 🔐 Security:
- Store credentials worden veilig opgeslagen in Vercel KV
- Alleen toegankelijk via je app
- Encrypted in transit
- Geen credentials in code

## 📊 Gratis Limieten:
- 30 MB storage (genoeg voor 1000+ stores)
- 10,000 commands per dag
- 3,000 commands per uur
- **Meer dan genoeg voor jouw gebruik!**
