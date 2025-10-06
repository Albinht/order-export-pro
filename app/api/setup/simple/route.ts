import { NextResponse } from 'next/server';

// Simple setup that just sets environment variables
export async function POST(request: Request) {
  try {
    const { name, domain, platform, accessToken, consumerKey, consumerSecret } = await request.json();

    // For Vercel deployment, we'll return instructions since we can't set env vars dynamically
    const envVars = [];
    
    if (platform === 'shopify') {
      envVars.push(`SHOPIFY_STORE_DOMAIN=${domain}`);
      envVars.push(`SHOPIFY_ACCESS_TOKEN=${accessToken}`);
      envVars.push(`SHOPIFY_API_VERSION=2025-01`);
    } else if (platform === 'woocommerce') {
      // Store as JSON in a single env var for WooCommerce
      const wooConfig = {
        domain,
        consumerKey,
        consumerSecret
      };
      envVars.push(`WOOCOMMERCE_CONFIG=${JSON.stringify(wooConfig)}`);
    }

    // Return success with instructions
    return NextResponse.json({
      success: true,
      message: 'Configuration ready!',
      instructions: 'Add these environment variables to your Vercel dashboard:',
      envVars,
      nextSteps: [
        '1. Go to Vercel Dashboard',
        '2. Settings → Environment Variables',
        '3. Add the variables shown above',
        '4. Redeploy your application',
        '5. Login with admin / 1n$$2O%n2$f2'
      ]
    });
  } catch (error) {
    console.error('Simple setup error:', error);
    return NextResponse.json(
      { 
        error: 'Configuration failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Try refreshing the page and filling the form again'
      },
      { status: 500 }
    );
  }
}
