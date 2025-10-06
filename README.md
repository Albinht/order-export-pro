# Order Export Pro 📦

Een professionele multi-platform order management tool voor Shopify en WooCommerce met enterprise-level security.

## ✨ Features

- 🛍️ **Multi-Platform Support**: Shopify & WooCommerce
- 📊 **Excel Export**: Aangepaste kolommen met klantdata
- 📸 **Upload Detection**: Automatische herkenning van klant uploads
- 🔒 **Two-Factor Authentication**: TOTP-based 2FA
- 📱 **Progressive Web App**: Werkt offline op mobiel
- 📈 **Analytics Dashboard**: Real-time statistieken
- 🔍 **Audit Logging**: Complete activity tracking
- 🚀 **Auto-Fulfillment**: Automatisch orders markeren als verzonden

## 🚀 Quick Deploy naar Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Forder-export-pro&env=DATABASE_URL,SHOPIFY_STORE_DOMAIN,SHOPIFY_ACCESS_TOKEN,NEXTAUTH_SECRET)

## 📋 Vereisten

- Node.js 18+ 
- PostgreSQL database (productie)
- Shopify Admin API toegang
- WooCommerce REST API credentials (optioneel)

## 🛠️ Lokale Installatie

```bash
# Clone repository
git clone https://github.com/your-username/order-export-pro.git
cd order-export-pro

# Installeer dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local met je credentials

# Database setup
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

## 🔐 Environment Variables

```env
# Database (PostgreSQL voor productie)
DATABASE_URL="postgresql://user:password@localhost:5432/orderexport"

# Shopify
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_ACCESS_TOKEN="shpat_xxxxx"
SHOPIFY_API_VERSION="2025-01"

# Authentication
NEXTAUTH_SECRET="genereer-met-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"

# Optional
SENTRY_DSN="voor-error-tracking"
```

## 📦 Deployment Opties

### Vercel (Aanbevolen)
1. Push naar GitHub
2. Import in Vercel
3. Voeg environment variables toe
4. Deploy!

### Railway
- All-in-one hosting met database
- Automatische SSL & backups

### VPS (Geavanceerd)
- Volledige controle
- Nginx + PM2 + PostgreSQL
- Zie `deploy-guide.md` voor details

## 🔒 Security Features

- ✅ Two-Factor Authentication (TOTP)
- ✅ Session management met timeout
- ✅ IP whitelisting & rate limiting
- ✅ Audit trail van alle acties
- ✅ Encrypted API key storage
- ✅ HTTPS-only cookies
- ✅ CSP & security headers

## 📱 PWA Features

- ✅ Installeerbaar op mobiel/desktop
- ✅ Offline capability
- ✅ Background sync
- ✅ Push notifications
- ✅ Responsive design

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 📝 API Documentatie

### Orders
- `GET /api/orders` - Fetch orders
- `POST /api/orders/export` - Export to Excel
- `PUT /api/orders/[id]/fulfill` - Mark as fulfilled

### Stores
- `GET /api/stores` - List stores
- `POST /api/stores` - Add store
- `DELETE /api/stores/[id]` - Remove store

### Security
- `GET /api/auth/2fa-setup` - Setup 2FA
- `POST /api/auth/2fa-verify` - Verify token
- `GET /api/audit-logs` - View audit trail

## 🤝 Contributing

1. Fork het project
2. Maak je feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'Add AmazingFeature'`)
4. Push naar branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 License

MIT License - zie LICENSE file

## 🆘 Support

Voor vragen of hulp bij deployment:
- Open een GitHub issue
- Email: support@your-domain.com

## 🙏 Credits

Gebouwd met:
- [Next.js 15](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shopify Admin API](https://shopify.dev/)
- [WooCommerce REST API](https://woocommerce.github.io/)
