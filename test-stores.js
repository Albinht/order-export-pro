// Test script to verify both stores are seeded correctly
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStores() {
  try {
    console.log('🔍 Testing store seeding...\n');

    // Get all stores
    const stores = await prisma.store.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`📦 Found ${stores.length} stores in database:\n`);

    stores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   Domain: ${store.domain}`);
      console.log(`   Platform: ${store.platform}`);
      console.log(`   Active: ${store.isActive ? '✅' : '❌'}`);
      console.log(`   Has Token: ${store.accessToken ? '✅' : '❌'}`);
      console.log('');
    });

    // Check if both expected stores exist
    const expectedStores = [
      'malen-nach-zahlen-experte.myshopify.com',
      'painting-expert.myshopify.com'
    ];

    console.log('✅ Checking for expected stores:');
    for (const domain of expectedStores) {
      const store = stores.find(s => s.domain === domain);
      if (store) {
        console.log(`   ✅ ${domain} - FOUND`);
      } else {
        console.log(`   ❌ ${domain} - MISSING`);
      }
    }

    await prisma.$disconnect();
    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testStores();
