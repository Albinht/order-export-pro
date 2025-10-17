import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStore } from '@/lib/store-manager';
import { ShopifyClient } from '@/lib/shopify/client';

interface TrackingInfo {
  number?: string;
  company?: string;
}

async function fulfillInShopify(storeId: string, orderId: string, tracking?: TrackingInfo) {
  const store = await getStore(storeId);

  if (!store) {
    throw new Error('Store not found');
  }

  if (store.platform !== 'shopify') {
    throw new Error('Fulfillment only supported for Shopify stores');
  }

  if (!store.accessToken) {
    throw new Error('Store is missing Shopify access token');
  }

  const client = new ShopifyClient(store.domain, store.accessToken, process.env.SHOPIFY_API_VERSION);
  const fulfillment = await client.createFulfillment(orderId, tracking?.number, tracking?.company);
  return fulfillment;
}

// GET order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const orderId = searchParams.get('orderId');
    
    const where: any = {};
    if (storeId) {
      where.storeId = storeId;
    }
    if (orderId) {
      where.orderId = orderId;
    }

    const statuses = await prisma.orderStatus.findMany({
      where,
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

    const orderIdStr = String(orderId);

    let fulfillmentId: string | null = null;

    if (status === 'fulfilled') {
      try {
        const fulfillment = await fulfillInShopify(storeId, orderIdStr, {
          number: trackingNumber || undefined,
          company: trackingCompany || undefined,
        });
        fulfillmentId = fulfillment?.id ? String(fulfillment.id) : null;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fulfill order in Shopify';
        return NextResponse.json({ error: message }, { status: 502 });
      }
    }

    const orderStatus = await prisma.orderStatus.upsert({
      where: {
        storeId_orderId: {
          storeId,
          orderId: orderIdStr,
        },
      },
      create: {
        storeId,
        orderId: orderIdStr,
        orderNumber,
        status,
        fulfillmentId,
        trackingNumber,
        trackingCompany,
        notes,
      },
      update: {
        orderNumber,
        status,
        fulfillmentId,
        trackingNumber,
        trackingCompany,
        notes,
      },
    });

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

    const results: Array<{ orderId: string; success: boolean; error?: string }> = [];

    // Process each order
    for (const { orderId, orderNumber } of orderIds) {
      try {
        const orderIdStr = String(orderId);

        let fulfillmentId: string | null = null;

        if (status === 'fulfilled') {
          try {
            const fulfillment = await fulfillInShopify(storeId, orderIdStr);
            fulfillmentId = fulfillment?.id ? String(fulfillment.id) : null;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fulfill order in Shopify';
            results.push({ orderId: orderIdStr, success: false, error: message });
            continue;
          }
        }

        await prisma.orderStatus.upsert({
          where: {
            storeId_orderId: {
              storeId,
              orderId: orderIdStr,
            },
          },
          create: {
            storeId,
            orderId: orderIdStr,
            orderNumber,
            status,
            fulfillmentId,
          },
          update: {
            orderNumber,
            status,
            fulfillmentId,
          },
        });

        results.push({ orderId: orderIdStr, success: true });
      } catch (error: any) {
        console.error(`Failed to process order ${orderId}:`, error);
        results.push({ orderId: String(orderId), success: false, error: error?.message || 'Update failed' });
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
