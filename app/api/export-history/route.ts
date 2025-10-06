import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET export history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    const where = storeId ? { storeId } : {};
    
    const history = await prisma.exportHistory.findMany({
      where,
      include: {
        store: true,
      },
      orderBy: { exportedAt: 'desc' },
      take: 50,
    });
    
    return NextResponse.json(history);
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

    const record = await prisma.exportHistory.create({
      data: {
        storeId,
        filename,
        orderCount,
        orderIds: JSON.stringify(orderIds),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating export history:', error);
    return NextResponse.json(
      { error: 'Failed to save export history' },
      { status: 500 }
    );
  }
}
