// Seed script to add both configured stores to database
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STORES_CONFIG = [
  {
    name: 'Malen Nach Zahlen Experte',
    domain: 'malen-nach-zahlen-experte.myshopify.com',
    tokenEnv: 'SHOPIFY_TOKEN_MALEN',
    platform: 'shopify',
  },
  {
    name: 'Painting Expert',
    domain: 'painting-expert.myshopify.com',
    tokenEnv: 'SHOPIFY_TOKEN_PAINTING',
    platform: 'shopify',
  },
];

async function seedStores() {
  try {
    console.log('🌱 Seeding stores...\n');

    for (const storeConfig of STORES_CONFIG) {
      const accessToken = process.env[storeConfig.tokenEnv];
      
      if (!accessToken) {
        console.log(`⚠️  Skipping ${storeConfig.name} - ${storeConfig.tokenEnv} not set in environment`);
        continue;
      }

      const existingStore = await prisma.store.findFirst({
        where: { domain: storeConfig.domain },
      });

      if (!existingStore) {
        const store = await prisma.store.create({
          data: {
            name: storeConfig.name,
            domain: storeConfig.domain,
            accessToken: accessToken,
            platform: storeConfig.platform,
            isActive: true,
          },
        });
        console.log(`✅ Created store: ${store.name}`);
      } else {
        console.log(`⏭️  Store already exists: ${existingStore.name}`);
      }
    }

    await prisma.$disconnect();
    console.log('\n✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding stores:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedStores();
