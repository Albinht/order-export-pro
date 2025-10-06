import { ShopifyOrder } from '@/types/shopify';
import { Store } from '@prisma/client';

export class MultiStoreShopifyClient {
  private storeDomain: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(store: Store) {
    this.storeDomain = store.domain;
    this.accessToken = store.accessToken;
    // Try 2023-10 API version for better compatibility with older stores
    this.apiVersion = process.env.SHOPIFY_API_VERSION || '2023-10';

    if (!this.storeDomain || !this.accessToken) {
      throw new Error('Missing Shopify credentials for store: ' + store.name);
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
        fulfillment_status: 'unfulfilled,partial', // Only get unfulfilled and partially fulfilled orders
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
        fulfillment_status: 'unfulfilled,partial', // Only get unfulfilled and partially fulfilled orders
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

  async fulfillOrder(orderId: string): Promise<any> {
    try {
      console.log(`Fulfilling order ${orderId} using modern FulfillmentOrder API`);
      
      // Step 1: Get FulfillmentOrders for this order
      const foResponse = await fetch(this.getApiUrl(`orders/${orderId}/fulfillment_orders.json`), {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!foResponse.ok) {
        if (foResponse.status === 403) {
          console.error('❌ Permission denied for FulfillmentOrders');
          return { 
            fulfillment: { 
              status: 'permission_denied', 
              error: 'API Token heeft geen fulfillment permissies',
              localOnly: true 
            } 
          };
        }
        console.error(`Failed to fetch fulfillment orders: ${foResponse.status}`);
        return { fulfillment: { status: 'failed', error: 'Could not get fulfillment orders' } };
      }

      const foData = await foResponse.json();
      const fulfillmentOrders = foData.fulfillment_orders || [];
      
      console.log(`Found ${fulfillmentOrders.length} fulfillment orders`);
      
      // Find open fulfillment orders that can be fulfilled
      const openFOs = fulfillmentOrders.filter((fo: any) => 
        fo.status === 'open' && 
        fo.supported_actions?.includes('create_fulfillment')
      );
      
      if (openFOs.length === 0) {
        console.log('No open fulfillment orders to fulfill');
        return { fulfillment: { status: 'already_fulfilled_or_no_items' } };
      }
      
      console.log(`Found ${openFOs.length} open FOs to fulfill`);
      
      // Step 2: Create fulfillment using modern API
      const fulfillmentBody = {
        fulfillment: {
          line_items_by_fulfillment_order: openFOs.map((fo: any) => ({
            fulfillment_order_id: fo.id
          }))
        }
      };
      
      console.log('Creating fulfillment...');
      
      const fulfillResponse = await fetch(this.getApiUrl('fulfillments.json'), {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fulfillmentBody),
      });
      
      const responseText = await fulfillResponse.text();
      
      if (fulfillResponse.ok) {
        try {
          const fulfillmentData = responseText ? JSON.parse(responseText) : {};
          console.log(`✅ Successfully fulfilled order!`);
          return { 
            fulfillment: { 
              status: 'success', 
              id: fulfillmentData.fulfillment?.id,
              name: fulfillmentData.fulfillment?.name
            } 
          };
        } catch (e) {
          // Empty response but status is OK means success
          console.log('✅ Order fulfilled (empty response)');
          return { fulfillment: { status: 'success' } };
        }
      }
      
      // Handle errors
      if (fulfillResponse.status === 403) {
        console.error('❌ Permission denied for fulfillment creation');
        return { 
          fulfillment: { 
            status: 'permission_denied', 
            error: 'API Token heeft geen write fulfillment permissies',
            localOnly: true 
          } 
        };
      } else if (fulfillResponse.status === 422) {
        console.error('Order cannot be fulfilled (422)');
        return { 
          fulfillment: { 
            status: 'cannot_fulfill', 
            error: 'Order kan niet worden fulfilled',
            localOnly: true 
          } 
        };
      }
      
      console.error(`Fulfillment failed: ${responseText || 'Unknown error'}`);
      return { 
        fulfillment: { 
          status: 'failed', 
          error: 'Fulfillment mislukt',
          localOnly: true 
        } 
      };
      
    } catch (error: any) {
      console.error('Fulfillment error:', error);
      return { 
        fulfillment: { 
          status: 'error', 
          message: error.message,
          localOnly: true 
        } 
      };
    }
  }
}
