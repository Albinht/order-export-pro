import { NextRequest, NextResponse } from 'next/server';
import { ShopifyClient } from '@/lib/shopify/client';
import { getStore } from '@/lib/store-manager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const storeId = searchParams.get('storeId');

    let client: ShopifyClient;
    
    if (storeId) {
      // Use specific store
      const store = await getStore(storeId);
      
      if (!store) {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        );
      }
      
      if (store.platform !== 'shopify') {
        return NextResponse.json(
          { error: 'Only Shopify stores are supported for order fetching' },
          { status: 400 }
        );
      }
      
      client = new ShopifyClient(store.domain, store.accessToken);
    } else {
      // Use default from environment variables
      client = new ShopifyClient();
    }
    
    let orders;
    if (startDate && endDate) {
      orders = await client.fetchOrdersWithDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      orders = await client.fetchOrders(limit);
    }

    // Log the first order's properties to see what data we're getting
    if (orders.length > 0 && orders[0].line_items.length > 0) {
      console.log('Sample order line item properties:', JSON.stringify(orders[0].line_items[0].properties, null, 2));
    }

    // Fetch product images for all unique products
    const uniqueProductIds = new Set<string>();
    orders.forEach(order => {
      order.line_items.forEach(item => {
        if (item.product_id) {
          uniqueProductIds.add(item.product_id);
        }
      });
    });

    const productImages = new Map<string, string>();
    
    // Fetch images in parallel for better performance
    const imagePromises = Array.from(uniqueProductIds).map(async (productId) => {
      const imageUrl = await client.fetchProductImage(productId);
      if (imageUrl) {
        productImages.set(productId, imageUrl);
      }
    });

    await Promise.all(imagePromises);

    return NextResponse.json({ 
      orders,
      productImages: Object.fromEntries(productImages)
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
