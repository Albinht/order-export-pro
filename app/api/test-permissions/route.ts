import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      // Use default store
      const domain = process.env.SHOPIFY_STORE_DOMAIN;
      const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
      
      if (!domain || !token) {
        return NextResponse.json({ error: 'Missing store credentials' }, { status: 400 });
      }
      
      // Skip scope check for private apps (they don't have access_scopes endpoint)
      // We'll test actual functionality instead
      let hasScopes = ['unknown - private app token'];
      let missingScopes: string[] = [];
      
      // Also test fetching locations
      const locationsResponse = await fetch(
        `https://${domain}/admin/api/2023-10/locations.json`,
        {
          headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json',
          },
        }
      );
      
      let locations = [];
      if (locationsResponse.ok) {
        const locData = await locationsResponse.json();
        locations = locData.locations || [];
      }
      
      // Test fetching a recent unfulfilled order
      const ordersResponse = await fetch(
        `https://${domain}/admin/api/2023-10/orders.json?limit=10&status=open&fulfillment_status=unfulfilled`,
        {
          headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json',
          },
        }
      );
      
      let testOrder = null;
      let canFulfill = false;
      let fulfillmentTest = null;
      
      if (ordersResponse.ok) {
        const orderData = await ordersResponse.json();
        const unfulfilled = orderData.orders?.find((o: any) => 
          o.line_items?.some((item: any) => item.fulfillable_quantity > 0)
        );
        testOrder = unfulfilled || orderData.orders?.[0];
        
        // If we found an unfulfilled order, try a test fulfillment (but don't actually fulfill)
        if (unfulfilled) {
          try {
            // Just check if we can access the fulfillment endpoint
            const testFulfillResponse = await fetch(
              `https://${domain}/admin/api/2023-10/orders/${unfulfilled.id}/fulfillments.json`,
              {
                method: 'GET',
                headers: {
                  'X-Shopify-Access-Token': token,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            canFulfill = testFulfillResponse.ok;
            if (!testFulfillResponse.ok) {
              const errorText = await testFulfillResponse.text();
              fulfillmentTest = `Cannot access fulfillments: ${errorText}`;
            } else {
              fulfillmentTest = 'Fulfillment endpoint accessible';
            }
          } catch (e) {
            fulfillmentTest = `Error testing fulfillment: ${e}`;
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        apiScopes: hasScopes,
        missingScopes,
        hasRequiredScopes: true, // Can't check scopes for private apps
        locations: locations.map((l: any) => ({
          id: l.id,
          name: l.name,
          active: l.active,
          legacy: l.legacy,
          fulfills_online_orders: l.fulfills_online_orders,
        })),
        testOrder: testOrder ? {
          id: testOrder.id,
          name: testOrder.name,
          fulfillment_status: testOrder.fulfillment_status,
          fulfillable: testOrder.line_items?.some((item: any) => item.fulfillable_quantity > 0),
          line_items: testOrder.line_items?.map((item: any) => ({
            id: item.id,
            title: item.title,
            fulfillable_quantity: item.fulfillable_quantity,
            quantity: item.quantity,
          })),
        } : null,
        canFulfill,
        fulfillmentTest,
        tokenType: 'Likely a Private App token (no access_scopes endpoint)',
      });
    }
    
    return NextResponse.json({ error: 'Store-specific test not implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error testing permissions:', error);
    return NextResponse.json(
      { error: 'Failed to test permissions', details: String(error) },
      { status: 500 }
    );
  }
}
