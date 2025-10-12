// Store manager using Vercel KV or fallback to in-memory storage
// For production: Use Vercel KV Store
// For development: Use in-memory storage

interface Store {
  id: string;
  name: string;
  domain: string;
  platform: 'shopify' | 'woocommerce';
  accessToken?: string;
  consumerKey?: string;
  consumerSecret?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for development/fallback
let inMemoryStores: Store[] = [];

// Check if we have Vercel KV available
const hasVercelKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Initialize with default store from env if available
if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ACCESS_TOKEN) {
  const defaultStore: Store = {
    id: 'default-store',
    name: 'Default Store',
    domain: process.env.SHOPIFY_STORE_DOMAIN,
    platform: 'shopify',
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryStores.push(defaultStore);
}

// KV Store operations (if available)
async function kvGet(key: string) {
  if (!hasVercelKV) return null;
  
  try {
    const response = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      },
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('KV Get error:', error);
    return null;
  }
}

async function kvSet(key: string, value: any) {
  if (!hasVercelKV) return false;
  
  try {
    const response = await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    });
    
    return response.ok;
  } catch (error) {
    console.error('KV Set error:', error);
    return false;
  }
}

// Store management functions
export async function getStores(): Promise<Store[]> {
  if (hasVercelKV) {
    const stores = await kvGet('stores');
    if (stores) {
      return JSON.parse(stores);
    }
  }
  return inMemoryStores;
}

export async function getStore(id: string): Promise<Store | null> {
  const stores = await getStores();
  return stores.find(s => s.id === id) || null;
}

export async function addStore(storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store> {
  const newStore: Store = {
    ...storeData,
    id: `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const stores = await getStores();
  stores.push(newStore);
  
  if (hasVercelKV) {
    await kvSet('stores', JSON.stringify(stores));
  } else {
    inMemoryStores = stores;
  }
  
  return newStore;
}

export async function updateStore(id: string, updates: Partial<Store>): Promise<Store | null> {
  const stores = await getStores();
  const index = stores.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  stores[index] = {
    ...stores[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  if (hasVercelKV) {
    await kvSet('stores', JSON.stringify(stores));
  } else {
    inMemoryStores = stores;
  }
  
  return stores[index];
}

export async function deleteStore(id: string): Promise<boolean> {
  const stores = await getStores();
  const filtered = stores.filter(s => s.id !== id);
  
  if (filtered.length === stores.length) return false;
  
  if (hasVercelKV) {
    await kvSet('stores', JSON.stringify(filtered));
  } else {
    inMemoryStores = filtered;
  }
  
  return true;
}
