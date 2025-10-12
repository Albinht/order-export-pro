import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for export history (resets on deployment)
let exportHistory: any[] = [];

// GET export history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    // Filter by storeId if provided
    const filtered = storeId 
      ? exportHistory.filter(h => h.storeId === storeId)
      : exportHistory;
    
    // Sort by date descending and take last 50
    const sorted = filtered
      .sort((a, b) => new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime())
      .slice(0, 50);
    
    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching export history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch export history' },
      { status: 500 }
    );
  }
}

// POST create export history record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, filename, orderCount, orderIds, metadata } = body;

    if (!storeId || !filename || !orderIds) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const record = {
      id: `export-${Date.now()}`,
      storeId,
      filename,
      orderCount,
      orderIds: JSON.stringify(orderIds),
      metadata: metadata ? JSON.stringify(metadata) : null,
      exportedAt: new Date().toISOString(),
    };

    exportHistory.push(record);

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating export history:', error);
    return NextResponse.json(
      { error: 'Failed to save export history' },
      { status: 500 }
    );
  }
}
