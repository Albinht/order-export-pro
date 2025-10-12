import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for order statuses (resets on deployment)
let orderStatuses: any[] = [];

// GET order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const orderId = searchParams.get('orderId');
    
    let filtered = orderStatuses;
    
    if (storeId) {
      filtered = filtered.filter(s => s.storeId === storeId);
    }
    if (orderId) {
      filtered = filtered.filter(s => s.orderId === orderId);
    }
    
    // Sort by updatedAt descending
    const sorted = filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return NextResponse.json(sorted);
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
    
    // Find existing status or create new one
    const existingIndex = orderStatuses.findIndex(
      s => s.storeId === storeId && s.orderId === orderIdStr
    );
    
    const orderStatus = {
      id: existingIndex >= 0 ? orderStatuses[existingIndex].id : `status-${Date.now()}`,
      storeId,
      orderId: orderIdStr,
      orderNumber,
      status,
      trackingNumber,
      trackingCompany,
      notes,
      createdAt: existingIndex >= 0 ? orderStatuses[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      orderStatuses[existingIndex] = orderStatus;
    } else {
      orderStatuses.push(orderStatus);
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

    const results = [];

    // Process each order
    for (const { orderId, orderNumber } of orderIds) {
      try {
        const orderIdStr = String(orderId);
        
        // Find existing status or create new one
        const existingIndex = orderStatuses.findIndex(
          s => s.storeId === storeId && s.orderId === orderIdStr
        );
        
        const orderStatus = {
          id: existingIndex >= 0 ? orderStatuses[existingIndex].id : `status-${Date.now()}-${orderId}`,
          storeId,
          orderId: orderIdStr,
          orderNumber,
          status,
          createdAt: existingIndex >= 0 ? orderStatuses[existingIndex].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        if (existingIndex >= 0) {
          orderStatuses[existingIndex] = orderStatus;
        } else {
          orderStatuses.push(orderStatus);
        }
        
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
