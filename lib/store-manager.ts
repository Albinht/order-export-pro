import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { Store as PrismaStore } from '@prisma/client';

export type StorePlatform = 'shopify' | 'woocommerce';

export interface StoreRecord {
  id: string;
  name: string;
  domain: string;
  platform: StorePlatform;
  accessToken?: string | null;
  consumerKey?: string | null;
  consumerSecret?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreInput {
  name: string;
  domain: string;
  platform: StorePlatform;
  accessToken?: string | null;
  consumerKey?: string | null;
  consumerSecret?: string | null;
  isActive?: boolean;
}

function serializeStore(store: PrismaStore): StoreRecord {
  return {
    ...store,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
    platform: store.platform as StorePlatform,
  };
}

const STORES_CONFIG = [
  {
    name: 'Malen Nach Zahlen Experte',
    domain: 'malen-nach-zahlen-experte.myshopify.com',
    tokenEnv: 'SHOPIFY_TOKEN_MALEN',
    platform: 'shopify' as const,
  },
  {
    name: 'Painting Expert',
    domain: 'painting-expert.myshopify.com',
    tokenEnv: 'SHOPIFY_TOKEN_PAINTING',
    platform: 'shopify' as const,
  },
];

async function ensureDefaultStore() {
  // Seed all configured stores if they don't exist
  for (const storeConfig of STORES_CONFIG) {
    const accessToken = process.env[storeConfig.tokenEnv];
    
    if (!accessToken) {
      continue;
    }

    const existing = await prisma.store.findFirst({
      where: { domain: storeConfig.domain },
    });

    if (!existing) {
      await prisma.store.create({
        data: {
          name: storeConfig.name,
          domain: storeConfig.domain,
          platform: storeConfig.platform,
          accessToken: accessToken,
          isActive: true,
        },
      });
      console.log(`Created store: ${storeConfig.name}`);
    }
  }
}

export async function getStores(): Promise<StoreRecord[]> {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: 'asc' },
  });

  if (stores.length === 0) {
    await ensureDefaultStore();
    const seededStores = await prisma.store.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return seededStores.map(serializeStore);
  }

  return stores.map(serializeStore);
}

export async function getStore(id: string): Promise<StoreRecord | null> {
  const store = await prisma.store.findUnique({ where: { id } });
  return store ? serializeStore(store) : null;
}

export async function addStore(data: StoreInput): Promise<StoreRecord> {
  try {
    const store = await prisma.store.create({
      data: {
        name: data.name,
        domain: data.domain.toLowerCase(),
        platform: data.platform,
        accessToken: data.accessToken,
        consumerKey: data.consumerKey,
        consumerSecret: data.consumerSecret,
        isActive: data.isActive ?? true,
      },
    });

    return serializeStore(store);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Store domain already exists');
    }
    throw error;
  }
}

export async function updateStore(id: string, updates: Partial<StoreInput>): Promise<StoreRecord | null> {
  try {
    const store = await prisma.store.update({
      where: { id },
      data: {
        name: updates.name,
        domain: updates.domain?.toLowerCase(),
        platform: updates.platform,
        accessToken: updates.accessToken,
        consumerKey: updates.consumerKey,
        consumerSecret: updates.consumerSecret,
        isActive: updates.isActive,
      },
    });

    return serializeStore(store);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deleteStore(id: string): Promise<boolean> {
  try {
    await prisma.store.delete({ where: { id } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return false;
    }
    throw error;
  }
}
