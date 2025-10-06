import { ShopifyOrder } from '@/types/shopify';

export class ShopifyClient {
  private storeDomain: string;
  private accessToken: string;
  private apiVersion: string;

  constructor() {
    this.storeDomain = process.env.SHOPIFY_STORE_DOMAIN || '';
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN || '';
    this.apiVersion = process.env.SHOPIFY_API_VERSION || '2024-10';

    if (!this.storeDomain || !this.accessToken) {
      throw new Error('Missing Shopify credentials. Please check your environment variables.');
    }
  }

  private getApiUrl(endpoint: string): string {
    return `https://${this.storeDomain}/admin/api/${this.apiVersion}/${endpoint}`;
  }

  async fetchOrders(limit: number = 50, status: string = 'any'): Promise<ShopifyOrder[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        status,
      });

      const response = await fetch(this.getApiUrl(`orders.json?${params}`), {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      throw error;
    }
  }

  async fetchOrdersWithDateRange(startDate: Date, endDate: Date): Promise<ShopifyOrder[]> {
    try {
      const params = new URLSearchParams({
        limit: '250',
        created_at_min: startDate.toISOString(),
        created_at_max: endDate.toISOString(),
        status: 'any',
      });

      const response = await fetch(this.getApiUrl(`orders.json?${params}`), {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      throw error;
    }
  }

  async fetchProductImage(productId: string): Promise<string | null> {
    try {
      const response = await fetch(this.getApiUrl(`products/${productId}.json`), {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch product ${productId}`);
        return null;
      }

      const data = await response.json();
      const product = data.product;
      
      if (product && product.image) {
        return product.image.src;
      } else if (product && product.images && product.images.length > 0) {
        return product.images[0].src;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching product image for ${productId}:`, error);
      return null;
    }
  }
}
