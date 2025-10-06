import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all stores
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

// POST create new store
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain, platform = 'shopify', accessToken, consumerKey, consumerSecret } = body;

    // Validate based on platform
    if (!name || !domain || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (platform === 'shopify' && !accessToken) {
      return NextResponse.json(
        { error: 'Access token is required for Shopify stores' },
        { status: 400 }
      );
    }

    if (platform === 'woocommerce' && (!consumerKey || !consumerSecret)) {
      return NextResponse.json(
        { error: 'Consumer key and secret are required for WooCommerce stores' },
        { status: 400 }
      );
    }

    const store = await prisma.store.create({
      data: {
        name,
        domain,
        platform,
        accessToken: platform === 'shopify' ? accessToken : null,
        consumerKey: platform === 'woocommerce' ? consumerKey : null,
        consumerSecret: platform === 'woocommerce' ? consumerSecret : null,
      },
    });

    return NextResponse.json(store);
  } catch (error: any) {
    console.error('Error creating store:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Store with this domain already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}

// DELETE store
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Check if it's the last store
    const storeCount = await prisma.store.count({
      where: { isActive: true }
    });
    
    if (storeCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last store. At least one store must remain.' },
        { status: 400 }
      );
    }

    // Delete related data first (cascade delete)
    await prisma.orderStatus.deleteMany({
      where: { storeId: id }
    });
    
    await prisma.exportHistory.deleteMany({
      where: { storeId: id }
    });

    // Delete the store
    await prisma.store.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      { error: 'Failed to delete store' },
      { status: 500 }
    );
  }
}
