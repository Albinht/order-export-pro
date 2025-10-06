import { prisma } from './prisma';

export async function seedDefaultStore() {
  try {
    // Check if default store already exists
    const existingStore = await prisma.store.findUnique({
      where: { domain: process.env.SHOPIFY_STORE_DOMAIN || '' },
    });

    if (!existingStore && process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ACCESS_TOKEN) {
      // Create default store from environment variables
      const defaultStore = await prisma.store.create({
        data: {
          name: 'Default Store',
          domain: process.env.SHOPIFY_STORE_DOMAIN,
          accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
          platform: 'shopify', // Explicitly set platform
          isActive: true
        },
      });
      
      console.log('Default store created:', defaultStore.name);
      return defaultStore;
    }

    return existingStore;
  } catch (error) {
    console.error('Error seeding default store:', error);
    return null;
  }
}
