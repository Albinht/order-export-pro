export interface ShopifyOrder {
  id: string;
  name: string; // Order number (e.g., #1001)
  created_at: string;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  } | null;
  line_items: LineItem[];
  shipping_address?: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
    name?: string;
  };
  phone?: string;
  email?: string;
}

export interface LineItem {
  id: string;
  title: string;
  variant_title: string | null;
  quantity: number;
  price: string;
  sku: string | null;
  product_id: string;
  variant_id: string;
  properties: Array<{
    name: string;
    value: string;
  }>;
}

export interface ExportRow {
  orderId: string;
  photo: string;
  size: string;
  quantity: number;
  stones: string;
  minimalColors: string;
  framed: string;
  extra: string;
  extra1: string;
  extra2: string;
  country: string;
  name: string; // 收件人姓名
  city: string; // 收件人城市
  street: string;
  phoneEmail: string; // 收件人电话/Email
  zipCode: string; // 收件人邮编
}
