# 🏪 Auto-Loading Stores

## Overzicht

Je applicatie is nu geconfigureerd om automatisch stores te laden bij het opstarten. Er zijn momenteel **4 stores** beschikbaar:

### Shopify Stores (Auto-configured)
1. **Malen Nach Zahlen Experte**
   - Domain: `malen-nach-zahlen-experte.myshopify.com`
   - Token: Automatisch geladen via `SHOPIFY_TOKEN_MALEN`
   - ✅ Wordt automatisch bijgewerkt bij elke API call

2. **Painting Expert**
   - Domain: `painting-expert.myshopify.com`
   - Token: Automatisch geladen via `SHOPIFY_TOKEN_PAINTING`
   - ✅ Wordt automatisch bijgewerkt bij elke API call

### WooCommerce Stores (Manual)
3. **SONW**
   - Domain: `Schilderenopnummerwinkel.nl`
   - API Keys: Handmatig toegevoegd

4. **PBN-UK**
   - Domain: `Paintingbynumbers-expert.co.uk`
   - API Keys: Handmatig toegevoegd

## Hoe het werkt

### Automatische Seeding
- Bij elke call naar `/api/stores` worden de geconfigureerde Shopify stores automatisch:
  - **Aangemaakt** als ze nog niet bestaan
  - **Bijgewerkt** als ze al bestaan (naam en token worden gesynchroniseerd)
  
### Configuratie
De stores worden automatisch geladen vanuit:
- **Code**: `lib/store-manager.ts` → `STORES_CONFIG` array
- **Environment**: `.env.local` → `SHOPIFY_TOKEN_MALEN` en `SHOPIFY_TOKEN_PAINTING`

### Handmatig seeden
Je kunt ook handmatig alle stores seeden/updaten:

```bash
npm run db:seed
```

Dit script:
- Controleert of stores al bestaan
- Maakt nieuwe stores aan als ze niet bestaan
- Update bestaande stores met de laatste naam en credentials

## Nieuwe Store Toevoegen

### Optie 1: Automatisch (Shopify)
1. Voeg toe aan `lib/store-manager.ts` → `STORES_CONFIG`:
```typescript
{
  name: 'Nieuwe Store',
  domain: 'nieuwe-store.myshopify.com',
  tokenEnv: 'SHOPIFY_TOKEN_NIEUWE',
  platform: 'shopify' as const,
}
```

2. Voeg token toe aan `.env.local`:
```
SHOPIFY_TOKEN_NIEUWE=shpat_xxxxx
```

3. Klaar! De store wordt automatisch geladen bij de volgende API call

### Optie 2: Via Dashboard
1. Open de applicatie
2. Ga naar "Store Management"
3. Klik op "Add Store"
4. Vul de gegevens in
5. Store wordt direct opgeslagen in de database

## Database Status

Huidige stores in database: **4**
- 2 Shopify stores (auto-configured)
- 2 WooCommerce stores (manual)

Alle stores zijn **actief** en **klaar voor gebruik**! ✅
