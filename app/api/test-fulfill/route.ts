import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }
    
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-01';
    
    console.log('=== Testing Modern FulfillmentOrder API ===');
    console.log('Order ID:', orderId);
    console.log('API Version:', apiVersion);
    
    // Step 1: Get FulfillmentOrders for this order
    const foResponse = await fetch(
      `https://${domain}/admin/api/${apiVersion}/orders/${orderId}/fulfillment_orders.json`,
      {
        headers: {
          'X-Shopify-Access-Token': token!,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!foResponse.ok) {
      const errorText = await foResponse.text();
      console.error('Failed to fetch fulfillment orders:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch fulfillment orders', 
        details: errorText,
        status: foResponse.status 
      }, { status: 500 });
    }
    
    const foData = await foResponse.json();
    const fulfillmentOrders = foData.fulfillment_orders || [];
    
    console.log(`Found ${fulfillmentOrders.length} fulfillment orders`);
    fulfillmentOrders.forEach((fo: any) => {
      console.log(`FO ${fo.id}: status=${fo.status}, supported_actions=${fo.supported_actions?.join(', ')}`);
    });
    
    // Find open fulfillment orders
    const openFOs = fulfillmentOrders.filter((fo: any) => 
      fo.status === 'open' && fo.supported_actions?.includes('create_fulfillment')
    );
    
    if (openFOs.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No open fulfillment orders found',
        fulfillmentOrders: fulfillmentOrders.map((fo: any) => ({
          id: fo.id,
          status: fo.status,
          supported_actions: fo.supported_actions
        }))
      });
    }
    
    console.log(`Found ${openFOs.length} open FOs to fulfill`);
    
    // Step 2: Create fulfillment using the NEW API
    const fulfillmentBody = {
      fulfillment: {
        line_items_by_fulfillment_order: openFOs.map((fo: any) => ({
          fulfillment_order_id: fo.id
        }))
      }
    };
    
    console.log('Creating fulfillment with body:', JSON.stringify(fulfillmentBody, null, 2));
    
    const fulfillResponse = await fetch(
      `https://${domain}/admin/api/${apiVersion}/fulfillments.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': token!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fulfillmentBody),
      }
    );
    
    const responseText = await fulfillResponse.text();
    console.log('Fulfillment response status:', fulfillResponse.status);
    console.log('Response:', responseText);
    
    if (!fulfillResponse.ok) {
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = responseText;
      }
      
      console.error('Fulfillment failed:', errorDetails);
      
      // Try even simpler body
      console.log('Retrying with minimal body...');
      const minimalBody = {
        fulfillment: {
          line_items_by_fulfillment_order: [
            {
              fulfillment_order_id: openFOs[0].id
            }
          ]
        }
      };
      
      const retryResponse = await fetch(
        `https://${domain}/admin/api/${apiVersion}/fulfillments.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': token!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(minimalBody),
        }
      );
      
      const retryText = await retryResponse.text();
      if (retryResponse.ok) {
        const retryData = JSON.parse(retryText);
        return NextResponse.json({
          success: true,
          message: 'Order fulfilled successfully (retry)',
          fulfillment: retryData.fulfillment
        });
      }
      
      return NextResponse.json({ 
        success: false,
        error: 'Fulfillment failed',
        status: fulfillResponse.status,
        details: errorDetails,
        retryError: retryText
      }, { status: 500 });
    }
    
    const fulfillmentData = JSON.parse(responseText);
    
    return NextResponse.json({
      success: true,
      message: 'Order fulfilled successfully!',
      fulfillment: fulfillmentData.fulfillment
    });
    
  } catch (error: any) {
    console.error('Test fulfillment error:', error);
    return NextResponse.json(
      { 
        error: 'Test fulfillment failed', 
        details: error?.message || String(error) 
      },
      { status: 500 }
    );
  }
}
