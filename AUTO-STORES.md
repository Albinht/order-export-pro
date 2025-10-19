# 🏪 Automatische Store Setup

## ✅ Stores worden AUTOMATISCH aangemaakt!

De applicatie maakt automatisch beide stores aan bij de eerste API request. Je hoeft **NIETS** handmatig te doen!

### Geconfigureerde Stores:

1. **Malen Nach Zahlen Experte**
   - Domain: `malen-nach-zahlen-experte.myshopify.com`
   - Token: Uit `SHOPIFY_TOKEN_MALEN` environment variable

2. **Painting Expert**
   - Domain: `painting-expert.myshopify.com`
   - Token: Uit `SHOPIFY_TOKEN_PAINTING` environment variable

### Hoe het werkt:

1. **Bij elke `/api/stores` request** wordt automatisch gecontroleerd of de stores bestaan
2. **Als een store niet bestaat** → wordt automatisch aangemaakt met de environment variable token
3. **Stores zijn direct beschikbaar** voor gebruik in de dashboard

### Vereisten:

Zorg dat deze environment variables zijn ingesteld (in Vercel of lokaal):

```bash
SHOPIFY_TOKEN_MALEN=shpat_your_malen_token_here
SHOPIFY_TOKEN_PAINTING=shpat_your_painting_token_here
```

**Echte waarden**: Zie `CREDENTIALS.local.md` (lokaal bestand, niet in git)

### Verificatie:

**Test dat stores automatisch zijn aangemaakt:**

1. Open: `https://your-app.vercel.app/api/health`
2. Check `stores.count` → Moet `2` zijn
3. Check `stores.list` → Beide stores zichtbaar

Of:

1. Open: `https://your-app.vercel.app/api/stores`
2. Je ziet direct beide stores in de response

### Logs:

In de Vercel logs zie je bij eerste request:

```
✅ Auto-created store: Malen Nach Zahlen Experte
✅ Auto-created store: Painting Expert
```

Bij volgende requests:
```
(stores already exist - geen logs)
```

### Voordeel:

🎯 **Zero Configuration Required!**
- Geen handmatige store setup nodig
- Stores worden automatisch klaargezet
- Bij deployment meteen werkend
- Environment variables zijn de enige configuratie

### Troubleshooting:

**Stores worden niet aangemaakt?**
1. Check `/api/health` → Kijk naar missing environment variables
2. Verify `SHOPIFY_TOKEN_MALEN` en `SHOPIFY_TOKEN_PAINTING` zijn ingesteld
3. Check Vercel logs voor warnings

**Store tokens werken niet?**
1. Tokens moeten beginnen met `shpat_`
2. Check CREDENTIALS.local.md voor de juiste waarden
3. Tokens moeten correct zijn gekopieerd naar Vercel environment variables
