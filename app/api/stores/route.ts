import { NextRequest, NextResponse } from 'next/server';
import { getStores, addStore, updateStore, deleteStore } from '@/lib/store-manager';

// GET all stores
export async function GET() {
  try {
    const stores = await getStores();
    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

// POST new store
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.domain || !body.platform) {
      return NextResponse.json(
        { error: 'Missing required fields: name, domain, platform' },
        { status: 400 }
      );
    }
    
    // For Shopify, require access token
    if (body.platform === 'shopify' && !body.accessToken) {
      return NextResponse.json(
        { error: 'Access token is required for Shopify stores' },
        { status: 400 }
      );
    }
    
    // For WooCommerce, require consumer key and secret
    if (body.platform === 'woocommerce' && (!body.consumerKey || !body.consumerSecret)) {
      return NextResponse.json(
        { error: 'Consumer key and secret are required for WooCommerce stores' },
        { status: 400 }
      );
    }
    
    // Test the connection before saving
    if (body.platform === 'shopify') {
      try {
        const testResponse = await fetch(
          `https://${body.domain}/admin/api/2025-01/shop.json`,
          {
            headers: {
              'X-Shopify-Access-Token': body.accessToken,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!testResponse.ok) {
          return NextResponse.json(
            { error: 'Failed to connect to Shopify store. Please check your credentials.' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to connect to Shopify store. Please check your domain and access token.' },
          { status: 400 }
        );
      }
    }
    
    const newStore = await addStore({
      name: body.name,
      domain: body.domain,
      platform: body.platform,
      accessToken: body.accessToken,
      consumerKey: body.consumerKey,
      consumerSecret: body.consumerSecret,
      isActive: body.isActive !== false,
    });
    
    return NextResponse.json({ 
      success: true, 
      store: newStore,
      message: 'Store added successfully!' 
    });
  } catch (error) {
    console.error('Failed to add store:', error);
    return NextResponse.json(
      { error: 'Failed to add store' },
      { status: 500 }
    );
  }
}

// PUT update store
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }
    
    const updatedStore = await updateStore(body.id, body);
    
    if (!updatedStore) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      store: updatedStore 
    });
  } catch (error) {
    console.error('Failed to update store:', error);
    return NextResponse.json(
      { error: 'Failed to update store' },
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
    
    const success = await deleteStore(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Store deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete store:', error);
    return NextResponse.json(
      { error: 'Failed to delete store' },
      { status: 500 }
    );
  }
}
