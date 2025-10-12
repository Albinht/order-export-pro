import { ShopifyOrder } from '@/types/shopify';

export class ShopifyClient {
  private storeDomain: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(domain?: string, accessToken?: string, apiVersion?: string) {
    // Allow passing credentials or fallback to env vars
    this.storeDomain = domain || process.env.SHOPIFY_STORE_DOMAIN || '';
    this.accessToken = accessToken || process.env.SHOPIFY_ACCESS_TOKEN || '';
    this.apiVersion = apiVersion || process.env.SHOPIFY_API_VERSION || '2025-01';

    if (!this.storeDomain || !this.accessToken) {
      throw new Error('Missing Shopify credentials. Please check your store configuration.');
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

  async createFulfillment(orderId: string, trackingNumber?: string, trackingCompany?: string): Promise<any> {
    try {
      // First get the order to get fulfillment order ID
      const orderResponse = await fetch(this.getApiUrl(`orders/${orderId}.json`), {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!orderResponse.ok) {
        throw new Error(`Failed to fetch order: ${orderResponse.statusText}`);
      }

      const orderData = await orderResponse.json();
      const order = orderData.order;
      
      // Get fulfillable line items
      const lineItems = order.line_items.filter((item: any) => 
        item.fulfillable_quantity > 0
      ).map((item: any) => ({
        id: item.id,
        quantity: item.fulfillable_quantity
      }));

      if (lineItems.length === 0) {
        throw new Error('No items to fulfill');
      }

      // Create fulfillment
      const fulfillmentData: any = {
        fulfillment: {
          notify_customer: true,
          line_items: lineItems,
          location_id: order.location_id
        }
      };

      if (trackingNumber) {
        fulfillmentData.fulfillment.tracking_info = {
          number: trackingNumber,
          company: trackingCompany || 'Other'
        };
      }

      const response = await fetch(this.getApiUrl(`orders/${orderId}/fulfillments.json`), {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fulfillmentData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create fulfillment: ${error}`);
      }

      const data = await response.json();
      return data.fulfillment;
    } catch (error) {
      console.error('Error creating fulfillment:', error);
      throw error;
    }
  }

  async updateFulfillmentStatus(orderId: string, status: 'fulfilled' | 'unfulfilled' | 'partial'): Promise<boolean> {
    try {
      if (status === 'fulfilled') {
        // Create a fulfillment without tracking
        await this.createFulfillment(orderId);
        return true;
      }
      // For unfulfilled or partial, Shopify doesn't have a direct API
      // These are calculated states based on fulfillments
      return false;
    } catch (error) {
      console.error('Error updating fulfillment status:', error);
      throw error;
    }
  }
}
