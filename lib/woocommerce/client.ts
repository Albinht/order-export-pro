import { Store } from '@prisma/client';
import { ShopifyOrder } from '@/types/shopify';

export class WooCommerceClient {
  private domain: string;
  private consumerKey: string;
  private consumerSecret: string;
  private apiVersion: string = 'wc/v3';

  constructor(store: Store) {
    this.domain = store.domain;
    this.consumerKey = store.consumerKey || '';
    this.consumerSecret = store.consumerSecret || '';
  }

  private getApiUrl(endpoint: string): string {
    // Remove trailing slash from domain if present
    const cleanDomain = this.domain.replace(/\/$/, '');
    // Add https:// if not present
    const fullDomain = cleanDomain.startsWith('http') ? cleanDomain : `https://${cleanDomain}`;
    return `${fullDomain}/wp-json/${this.apiVersion}/${endpoint}`;
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
  }

  async fetchOrders(limit: number = 250): Promise<ShopifyOrder[]> {
    return this.getOrders(limit);
  }

  async fetchOrdersWithDateRange(startDate: Date, endDate: Date): Promise<ShopifyOrder[]> {
    try {
      const unfulfilled_statuses = ['processing', 'pending', 'on-hold'];
      const allOrders: any[] = [];
      
      for (const status of unfulfilled_statuses) {
        const url = this.getApiUrl(`orders?status=${status}&per_page=100&orderby=date&order=desc&after=${startDate.toISOString()}&before=${endDate.toISOString()}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) continue;
        
        const orders = await response.json();
        allOrders.push(...orders);
      }

      return allOrders.map(order => this.mapWooCommerceToShopifyOrder(order));
    } catch (error) {
      console.error('Error fetching WooCommerce orders with date range:', error);
      throw error;
    }
  }

  async fetchProductImage(productId: string): Promise<string | null> {
    return this.getProductImage(productId);
  }

  async getOrders(limit: number = 250): Promise<ShopifyOrder[]> {
    try {
      // WooCommerce API - fetch only unfulfilled orders (processing, pending-payment, on-hold)
      const unfulfilled_statuses = ['processing', 'pending', 'on-hold'];
      const allOrders: any[] = [];
      
      // Fetch orders for each unfulfilled status
      for (const status of unfulfilled_statuses) {
        const url = this.getApiUrl(`orders?status=${status}&per_page=${limit}&orderby=date&order=desc`);
        console.log(`Fetching WooCommerce orders with status: ${status}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
          const error = await response.text();
          console.error('Error details:', error);
          continue;
        }

        const orders = await response.json();
        allOrders.push(...orders);
      }

      console.log(`Fetched ${allOrders.length} unfulfilled WooCommerce orders`);

      // Map WooCommerce orders to our Shopify format - bind this context
      return allOrders.map(order => this.mapWooCommerceToShopifyOrder(order));
    } catch (error: any) {
      console.error('Error fetching WooCommerce orders:', error);
      throw error;
    }
  }

  private mapWooCommerceToShopifyOrder(wcOrder: any): ShopifyOrder {
    // Map WooCommerce order to Shopify-like format for compatibility
    return {
      id: wcOrder.id.toString(),
      name: `#${wcOrder.number}`,
      email: wcOrder.billing?.email || '',
      created_at: wcOrder.date_created,
      updated_at: wcOrder.date_modified,
      total_price: wcOrder.total,
      subtotal_price: wcOrder.total,
      total_tax: wcOrder.total_tax,
      currency: wcOrder.currency,
      financial_status: wcOrder.status === 'processing' ? 'paid' : 'pending',
      fulfillment_status: wcOrder.status === 'completed' ? 'fulfilled' : null,
      order_number: wcOrder.number,
      note: wcOrder.customer_note || '',
      tags: '',
      
      // Customer info
      customer: {
        id: wcOrder.customer_id?.toString() || '0',
        email: wcOrder.billing?.email || '',
        first_name: wcOrder.billing?.first_name || '',
        last_name: wcOrder.billing?.last_name || '',
        phone: wcOrder.billing?.phone || '',
        tags: '',
      },
      
      // Shipping address
      shipping_address: {
        first_name: wcOrder.shipping?.first_name || wcOrder.billing?.first_name || '',
        last_name: wcOrder.shipping?.last_name || wcOrder.billing?.last_name || '',
        address1: wcOrder.shipping?.address_1 || wcOrder.billing?.address_1 || '',
        address2: wcOrder.shipping?.address_2 || wcOrder.billing?.address_2 || '',
        city: wcOrder.shipping?.city || wcOrder.billing?.city || '',
        province: wcOrder.shipping?.state || wcOrder.billing?.state || '',
        country: wcOrder.shipping?.country || wcOrder.billing?.country || '',
        zip: wcOrder.shipping?.postcode || wcOrder.billing?.postcode || '',
        phone: wcOrder.billing?.phone || '',
        name: `${wcOrder.shipping?.first_name || wcOrder.billing?.first_name || ''} ${wcOrder.shipping?.last_name || wcOrder.billing?.last_name || ''}`.trim(),
        company: wcOrder.shipping?.company || wcOrder.billing?.company || '',
        country_code: wcOrder.shipping?.country || wcOrder.billing?.country || '',
        province_code: wcOrder.shipping?.state || wcOrder.billing?.state || '',
      },
      
      // Billing address
      billing_address: {
        first_name: wcOrder.billing?.first_name || '',
        last_name: wcOrder.billing?.last_name || '',
        address1: wcOrder.billing?.address_1 || '',
        address2: wcOrder.billing?.address_2 || '',
        city: wcOrder.billing?.city || '',
        province: wcOrder.billing?.state || '',
        country: wcOrder.billing?.country || '',
        zip: wcOrder.billing?.postcode || '',
        phone: wcOrder.billing?.phone || '',
        name: `${wcOrder.billing?.first_name || ''} ${wcOrder.billing?.last_name || ''}`.trim(),
        company: wcOrder.billing?.company || '',
        country_code: wcOrder.billing?.country || '',
        province_code: wcOrder.billing?.state || '',
      },
      
      // Line items
      line_items: wcOrder.line_items?.map((item: any) => ({
        id: item.id?.toString() || '',
        title: item.name || '',
        quantity: item.quantity || 0,
        price: item.price || '0',
        sku: item.sku || '',
        vendor: '',
        product_id: item.product_id?.toString() || '',
        variant_id: item.variation_id?.toString() || '',
        variant_title: this.extractVariantTitle(item), // This will be the size
        fulfillable_quantity: item.quantity || 0,
        fulfillment_status: null,
        properties: this.extractProperties(item), // This includes colors, frame type, etc.
      })) || [],
      
      // Shipping lines
      shipping_lines: wcOrder.shipping_lines?.map((line: any) => ({
        id: line.id?.toString() || '',
        title: line.method_title || '',
        price: line.total || '0',
        code: line.method_id || '',
        source: 'woocommerce',
      })) || [],
    };
  }

  private extractVariantTitle(item: any): string {
    // Look for size/afmeting in meta_data or attributes
    if (!item.meta_data || item.meta_data.length === 0) {
      // Try to extract from product name (e.g., "Product - 40x50cm")
      const sizeMatch = item.name?.match(/(\d+x\d+\s*cm|\d+\s*x\s*\d+)/i);
      if (sizeMatch) {
        return sizeMatch[1];
      }
      return '';
    }
    
    // Look for size/afmeting in meta_data
    const sizeMeta = item.meta_data.find((meta: any) => 
      meta.key.toLowerCase().includes('size') || 
      meta.key.toLowerCase().includes('afmeting') ||
      meta.key.toLowerCase().includes('maat') ||
      meta.key.toLowerCase().includes('formaat')
    );
    
    if (sizeMeta) {
      return sizeMeta.value?.toString() || '';
    }
    
    // Fallback: look for any dimension pattern in meta values
    for (const meta of item.meta_data) {
      if (meta.value && meta.value.toString().match(/\d+\s*x\s*\d+/)) {
        return meta.value.toString();
      }
    }
    
    return '';
  }

  private extractProperties(item: any): Array<{ name: string; value: string }> {
    // Extract custom properties from meta_data with proper mapping
    if (!item.meta_data || item.meta_data.length === 0) {
      return [];
    }
    
    const properties: Array<{ name: string; value: string }> = [];
    
    item.meta_data.forEach((meta: any) => {
      // Skip internal WooCommerce meta fields
      if (meta.key.startsWith('_')) return;
      
      const key = meta.key.toLowerCase();
      const value = meta.value?.toString() || '';
      
      // Map to standardized property names for export
      if (key.includes('kleur') || key.includes('color') || key.includes('colour')) {
        properties.push({ name: 'Minimal Colors', value });
      } else if (key.includes('steen') || key.includes('stone') || key.includes('diamond')) {
        properties.push({ name: 'Stones', value });
      } else if (key.includes('frame') || key.includes('lijst') || key.includes('canvas')) {
        // Detect frame type
        let frameType = value;
        if (value.toLowerCase().includes('opgerol') || value.toLowerCase().includes('rolled')) {
          frameType = 'Opgerold canvas';
        } else if (value.toLowerCase().includes('gemonteerd') || value.toLowerCase().includes('mounted')) {
          frameType = 'Gemonteerd op frame';
        } else if (value.toLowerCase().includes('doe-het-zelf') || value.toLowerCase().includes('diy')) {
          frameType = 'Doe-het-zelf frame';
        }
        properties.push({ name: 'Framed', value: frameType });
      } else if (key.includes('size') || key.includes('afmeting') || key.includes('maat')) {
        properties.push({ name: 'Size', value });
      } else if (key.includes('upload') || key.includes('image') || key.includes('photo')) {
        // Keep upload URLs
        properties.push({ name: meta.key, value });
      } else {
        // Keep other properties as-is
        properties.push({ name: meta.key, value });
      }
    });
    
    return properties;
  }

  async getProductImage(productId: string): Promise<string | null> {
    try {
      const response = await fetch(this.getApiUrl(`products/${productId}`), {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const product = await response.json();
      // Return the first image URL if available
      return product.images?.[0]?.src || null;
    } catch (error) {
      console.error(`Error fetching product image for ${productId}:`, error);
      return null;
    }
  }

  async fulfillOrder(orderId: string): Promise<any> {
    try {
      console.log(`Marking WooCommerce order ${orderId} as completed`);
      
      // In WooCommerce, we update the order status to 'completed'
      const response = await fetch(this.getApiUrl(`orders/${orderId}`), {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed'
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to complete order: ${error}`);
        return { fulfillment: { status: 'failed', error } };
      }

      const updatedOrder = await response.json();
      console.log(`✅ WooCommerce order ${updatedOrder.number} marked as completed`);
      
      return { 
        fulfillment: { 
          status: 'success', 
          id: updatedOrder.id,
          name: updatedOrder.number
        } 
      };
    } catch (error: any) {
      console.error('WooCommerce fulfillment error:', error);
      return { 
        fulfillment: { 
          status: 'error', 
          message: error.message 
        } 
      };
    }
  }
}
