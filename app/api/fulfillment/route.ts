import { NextRequest, NextResponse } from 'next/server';
import { ShopifyClient } from '@/lib/shopify/client';
import { getStore } from '@/lib/store-manager';

export async function POST(request: NextRequest) {
  try {
    const { orderId, trackingNumber, trackingCompany, action, storeId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    let client: ShopifyClient;
    
    if (storeId) {
      const store = await getStore(storeId);
      if (!store) {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        );
      }
      client = new ShopifyClient(store.domain, store.accessToken);
    } else {
      client = new ShopifyClient();
    }

    if (action === 'fulfill') {
      // Create fulfillment with optional tracking
      const fulfillment = await client.createFulfillment(
        orderId,
        trackingNumber,
        trackingCompany
      );

      return NextResponse.json({
        success: true,
        fulfillment,
        message: 'Order fulfilled successfully'
      });
    } else if (action === 'updateStatus') {
      // Update fulfillment status
      const success = await client.updateFulfillmentStatus(orderId, 'fulfilled');
      
      return NextResponse.json({
        success,
        message: success ? 'Status updated successfully' : 'Could not update status'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Fulfillment API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process fulfillment' },
      { status: 500 }
    );
  }
}

// Bulk fulfillment endpoint
export async function PUT(request: NextRequest) {
  try {
    const { orderIds, trackingInfo } = await request.json();

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: 'Order IDs array is required' },
        { status: 400 }
      );
    }

    const client = new ShopifyClient();
    const results = [];
    const errors = [];

    for (const orderId of orderIds) {
      try {
        const tracking = trackingInfo?.[orderId];
        const fulfillment = await client.createFulfillment(
          orderId,
          tracking?.number,
          tracking?.company
        );
        results.push({ orderId, success: true, fulfillment });
      } catch (error) {
        errors.push({ 
          orderId, 
          error: error instanceof Error ? error.message : 'Failed' 
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      fulfilled: results,
      errors,
      message: `Fulfilled ${results.length} of ${orderIds.length} orders`
    });
  } catch (error) {
    console.error('Bulk fulfillment error:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk fulfillment' },
      { status: 500 }
    );
  }
}
