import { Store } from '@prisma/client';
import { ShopifyOrder } from '@/types/shopify';
import { MultiStoreShopifyClient } from './shopify/multi-store-client';
import { WooCommerceClient } from './woocommerce/client';

export interface PlatformClient {
  getOrders(limit?: number): Promise<ShopifyOrder[]>;
  getProductImage(productId: string): Promise<string | null>;
  fulfillOrder(orderId: string): Promise<any>;
}

export function createPlatformClient(store: Store): PlatformClient {
  switch (store.platform) {
    case 'shopify':
      return new MultiStoreShopifyClient(store);
    case 'woocommerce':
      return new WooCommerceClient(store);
    default:
      throw new Error(`Unknown platform: ${store.platform}`);
  }
}
