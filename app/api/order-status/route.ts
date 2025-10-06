import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPlatformClient } from '@/lib/platform-client';

// GET order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const orderId = searchParams.get('orderId');
    
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (orderId) where.orderId = orderId;
    
    const statuses = await prisma.orderStatus.findMany({
      where,
      include: {
        store: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}

// POST update order status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, orderId, orderNumber, status, trackingNumber, trackingCompany, notes } = body;

    if (!storeId || !orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert orderId to string
    const orderIdStr = String(orderId);

    // Update or create order status in database
    const orderStatus = await prisma.orderStatus.upsert({
      where: {
        storeId_orderId: {
          storeId,
          orderId: orderIdStr,
        },
      },
      update: {
        status,
        trackingNumber,
        trackingCompany,
        notes,
      },
      create: {
        storeId,
        orderId: orderIdStr,
        orderNumber,
        status,
        trackingNumber,
        trackingCompany,
        notes,
      },
    });

    // If marking as fulfilled, also update in Shopify
    if (status === 'fulfilled') {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (store) {
        const client = createPlatformClient(store);
        try {
          const result = await client.fulfillOrder(orderIdStr);
          console.log('Fulfillment result:', result);
          
          // Check if fulfillment was successful
          if (result.fulfillment && (result.fulfillment.status === 'success' || result.fulfillment.count > 0)) {
            console.log('✅ Order fulfilled successfully in Shopify');
          } else {
            console.error('❌ Failed to fulfill order in Shopify:', result);
          }
        } catch (error) {
          console.error('Error fulfilling order in Shopify:', error);
          // Continue even if Shopify update fails - we have it recorded locally
        }
      }
    }

    return NextResponse.json(orderStatus);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

// PUT bulk update order statuses
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, orderIds, status } = body;

    if (!storeId || !orderIds || !Array.isArray(orderIds) || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get store for Shopify API access
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const client = createPlatformClient(store);
    const results = [];

    // Process each order
    for (const { orderId, orderNumber } of orderIds) {
      try {
        console.log(`Processing order ${orderNumber} (ID: ${orderId}) for store ${storeId}`);
        
        // Convert orderId to string (Shopify IDs are very large numbers)
        const orderIdStr = String(orderId);
        
        // Update database
        const orderStatus = await prisma.orderStatus.upsert({
          where: {
            storeId_orderId: {
              storeId,
              orderId: orderIdStr,
            },
          },
          update: { status },
          create: {
            storeId,
            orderId: orderIdStr,
            orderNumber,
            status,
          },
        });
        
        console.log(`Database updated for order ${orderNumber}`);

        // If marking as fulfilled, update in Shopify
        if (status === 'fulfilled') {
          try {
            console.log(`Attempting to fulfill order ${orderIdStr} in Shopify...`);
            const fulfillment = await client.fulfillOrder(orderIdStr);
            
            // Check if fulfillment was successful or already fulfilled
            if (fulfillment.fulfillment?.status === 'already_fulfilled') {
              console.log(`Order ${orderNumber} was already fulfilled`);
              results.push({ orderId: orderIdStr, success: true, note: 'Already fulfilled' });
            } else if (fulfillment.fulfillment?.localOnly) {
              // Fulfillment only worked locally due to permission issues
              console.log(`⚠️ Order ${orderNumber} marked as fulfilled locally only (API permissions missing)`);
              results.push({ 
                orderId: orderIdStr, 
                success: true, 
                localOnly: true,
                note: fulfillment.fulfillment?.error || 'Local only - API permissions missing' 
              });
            } else if (fulfillment.fulfillment?.id || fulfillment.fulfillment?.status === 'success') {
              // Update fulfillment ID in database if available
              if (fulfillment.fulfillment?.id) {
                await prisma.orderStatus.update({
                  where: { id: orderStatus.id },
                  data: {
                    fulfillmentId: String(fulfillment.fulfillment.id),
                  },
                });
              }
              console.log(`Order ${orderNumber} successfully fulfilled in Shopify`);
              results.push({ orderId: orderIdStr, success: true });
            } else {
              console.log(`Order ${orderNumber} fulfillment response:`, fulfillment);
              results.push({ orderId: orderIdStr, success: true, note: 'Fulfillment processed' });
            }
          } catch (shopifyError: any) {
            console.error(`Failed to fulfill order ${orderIdStr} in Shopify:`, shopifyError?.message || shopifyError);
            results.push({ orderId: orderIdStr, success: false, error: shopifyError?.message || 'Shopify fulfillment failed' });
          }
        } else {
          results.push({ orderId: orderIdStr, success: true });
        }
      } catch (error: any) {
        console.error(`Failed to process order ${orderId}:`, error);
        console.error('Error details:', error?.message, error?.code);
        results.push({ orderId: String(orderId), success: false, error: error?.message || 'Database update failed' });
      }
    }

    return NextResponse.json({ 
      updated: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results 
    });
  } catch (error) {
    console.error('Error bulk updating order statuses:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update order statuses' },
      { status: 500 }
    );
  }
}
