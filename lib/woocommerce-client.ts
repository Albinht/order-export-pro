import axios from 'axios';
import { ShopifyOrder } from '@/types/shopify';

export class WooCommerceClient {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(domain: string, consumerKey: string, consumerSecret: string) {
    this.baseUrl = `https://${domain}/wp-json/wc/v3`;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
  }

  private getAuthHeader() {
    const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async fetchOrders(limit: number = 100): Promise<ShopifyOrder[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/orders`, {
        headers: {
          'Authorization': this.getAuthHeader()
        },
        params: {
          per_page: limit,
          status: ['processing', 'pending', 'on-hold'], // Only unfulfilled orders
          orderby: 'date',
          order: 'desc'
        }
      });

      return this.transformWooCommerceOrders(response.data);
    } catch (error) {
      console.error('WooCommerce API Error:', error);
      throw new Error('Failed to fetch WooCommerce orders');
    }
  }

  async fetchOrdersWithDateRange(startDate: Date, endDate: Date): Promise<ShopifyOrder[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/orders`, {
        headers: {
          'Authorization': this.getAuthHeader()
        },
        params: {
          after: startDate.toISOString(),
          before: endDate.toISOString(),
          status: ['processing', 'pending', 'on-hold'],
          per_page: 100
        }
      });

      return this.transformWooCommerceOrders(response.data);
    } catch (error) {
      console.error('WooCommerce API Error:', error);
      throw new Error('Failed to fetch WooCommerce orders with date range');
    }
  }

  async fetchProductImage(productId: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/products/${productId}`, {
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      return response.data.images?.[0]?.src || null;
    } catch (error) {
      console.error('Failed to fetch product image:', error);
      return null;
    }
  }

  async markOrderAsFulfilled(orderId: string): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/orders/${orderId}`,
        { status: 'completed' },
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Failed to mark WooCommerce order as fulfilled:', error);
      throw error;
    }
  }

  private transformWooCommerceOrders(wooOrders: any[]): ShopifyOrder[] {
    return wooOrders.map(order => ({
      id: order.id.toString(),
      name: `#${order.number}`,
      email: order.billing.email,
      phone: order.billing.phone,
      created_at: order.date_created,
      updated_at: order.date_modified,
      currency: order.currency,
      total_price: order.total,
      subtotal_price: order.subtotal || order.total,
      total_tax: order.total_tax || '0',
      financial_status: order.payment_method_title ? 'paid' : 'pending',
      fulfillment_status: this.mapWooStatusToFulfillment(order.status),
      
      customer: {
        id: order.customer_id,
        email: order.billing.email,
        first_name: order.billing.first_name,
        last_name: order.billing.last_name,
        phone: order.billing.phone
      },
      
      shipping_address: {
        first_name: order.shipping.first_name || order.billing.first_name,
        last_name: order.shipping.last_name || order.billing.last_name,
        name: `${order.shipping.first_name || order.billing.first_name} ${order.shipping.last_name || order.billing.last_name}`.trim(),
        address1: order.shipping.address_1 || order.billing.address_1,
        address2: order.shipping.address_2 || order.billing.address_2,
        city: order.shipping.city || order.billing.city,
        province: order.shipping.state || order.billing.state,
        country: order.shipping.country || order.billing.country,
        zip: order.shipping.postcode || order.billing.postcode,
        phone: order.billing.phone,
        company: order.shipping.company || order.billing.company
      },
      
      billing_address: {
        first_name: order.billing.first_name,
        last_name: order.billing.last_name,
        name: `${order.billing.first_name} ${order.billing.last_name}`.trim(),
        address1: order.billing.address_1,
        address2: order.billing.address_2,
        city: order.billing.city,
        province: order.billing.state,
        country: order.billing.country,
        zip: order.billing.postcode,
        phone: order.billing.phone,
        company: order.billing.company
      },
      
      line_items: order.line_items.map((item: any) => ({
        id: item.id.toString(),
        product_id: item.product_id.toString(),
        variant_id: item.variation_id?.toString() || item.product_id.toString(),
        title: item.name,
        variant_title: this.extractVariantTitle(item),
        quantity: item.quantity,
        price: item.price.toString(),
        total_discount: item.total_discount || '0',
        properties: this.extractItemProperties(item.meta_data)
      })),
      
      shipping_lines: order.shipping_lines?.map((line: any) => ({
        id: line.id.toString(),
        title: line.method_title,
        price: line.total,
        code: line.method_id
      })) || []
    }));
  }

  private mapWooStatusToFulfillment(status: string): string {
    switch (status) {
      case 'completed':
      case 'shipped':
        return 'fulfilled';
      case 'processing':
      case 'pending':
      case 'on-hold':
        return 'unfulfilled';
      case 'cancelled':
      case 'refunded':
      case 'failed':
        return 'cancelled';
      default:
        return 'unfulfilled';
    }
  }

  private extractVariantTitle(item: any): string {
    // Extract variation attributes from meta_data
    const attributes = item.meta_data?.filter((meta: any) => 
      meta.key.startsWith('pa_') || meta.key.includes('attribute_')
    ) || [];
    
    if (attributes.length > 0) {
      return attributes.map((attr: any) => attr.value).join(' / ');
    }
    
    // Fallback to SKU or empty
    return item.sku || '';
  }

  private extractItemProperties(metaData: any[]): Array<{ name: string; value: string }> {
    if (!metaData || metaData.length === 0) return [];
    
    return metaData
      .filter(meta => !meta.key.startsWith('_') && !meta.key.startsWith('pa_')) // Filter internal meta
      .map(meta => ({
        name: meta.key.replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase()),
        value: meta.value?.toString() || ''
      }));
  }
}
