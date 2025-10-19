import { NextRequest, NextResponse } from 'next/server';
import { getStores, addStore, updateStore, deleteStore } from '@/lib/store-manager';

// GET all stores - Automatically creates hardcoded stores on first call
export async function GET() {
  try {
    // This call automatically ensures both hardcoded stores exist
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
    
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const domain = typeof body.domain === 'string' ? body.domain.trim() : '';
    const platform = typeof body.platform === 'string' ? body.platform.trim() : '';
    const accessToken = typeof body.accessToken === 'string' ? body.accessToken.trim() : body.accessToken;
    const consumerKey = typeof body.consumerKey === 'string' ? body.consumerKey.trim() : body.consumerKey;
    const consumerSecret = typeof body.consumerSecret === 'string' ? body.consumerSecret.trim() : body.consumerSecret;

    // Validate required fields
    if (!name || !domain || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: name, domain, platform' },
        { status: 400 }
      );
    }
    
    // For Shopify, require access token
    if (platform === 'shopify' && !accessToken) {
      return NextResponse.json(
        { error: 'Access token is required for Shopify stores' },
        { status: 400 }
      );
    }
    
    // For WooCommerce, require consumer key and secret
    if (platform === 'woocommerce' && (!consumerKey || !consumerSecret)) {
      return NextResponse.json(
        { error: 'Consumer key and secret are required for WooCommerce stores' },
        { status: 400 }
      );
    }
    
    // Test the connection before saving
    if (platform === 'shopify') {
      try {
        const testResponse = await fetch(
          `https://${domain}/admin/api/2025-01/shop.json`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
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
    
    let newStore;

    try {
      newStore = await addStore({
        name,
        domain,
        platform,
        accessToken,
        consumerKey,
        consumerSecret,
        isActive: body.isActive !== false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add store';
      const status = message.includes('domain') ? 409 : 500;
      return NextResponse.json({ error: message }, { status });
    }
    
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

    const updates: Record<string, any> = { ...body };
    if (typeof updates.name === 'string') {
      updates.name = updates.name.trim();
    }
    if (typeof updates.domain === 'string') {
      updates.domain = updates.domain.trim();
    }
    if (typeof updates.accessToken === 'string') {
      updates.accessToken = updates.accessToken.trim();
    }
    if (typeof updates.consumerKey === 'string') {
      updates.consumerKey = updates.consumerKey.trim();
    }
    if (typeof updates.consumerSecret === 'string') {
      updates.consumerSecret = updates.consumerSecret.trim();
    }
    
    let updatedStore;

    try {
      updatedStore = await updateStore(body.id, updates);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update store';
      const status = message.includes('domain') ? 409 : 500;
      return NextResponse.json({ error: message }, { status });
    }
    
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
