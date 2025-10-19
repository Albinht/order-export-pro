import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check critical environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL || !!process.env.TURSO_DATABASE_URL,
      DATABASE_AUTH_TOKEN: !!process.env.DATABASE_AUTH_TOKEN || !!process.env.TURSO_AUTH_TOKEN,
      SHOPIFY_TOKEN_MALEN: !!process.env.SHOPIFY_TOKEN_MALEN,
      SHOPIFY_TOKEN_PAINTING: !!process.env.SHOPIFY_TOKEN_PAINTING,
      SHOPIFY_API_VERSION: !!process.env.SHOPIFY_API_VERSION,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
    };

    // Check for missing environment variables
    const missing = Object.entries(envCheck)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing environment variables',
          missing: missing,
          help: 'Add these variables in Vercel: Settings → Environment Variables',
        },
        { status: 500 }
      );
    }

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Count stores
    const storeCount = await prisma.store.count();

    // Get store names
    const stores = await prisma.store.findMany({
      select: { name: true, domain: true, isActive: true },
    });

    return NextResponse.json({
      status: 'ok',
      message: 'All systems operational',
      database: {
        connected: true,
        type: process.env.DATABASE_URL?.startsWith('libsql://') ? 'Turso' : 'SQLite',
      },
      stores: {
        count: storeCount,
        list: stores,
      },
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
      },
    });
  } catch (error: any) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Health check failed',
        error: {
          type: error.name,
          details: error.message,
        },
        troubleshooting: {
          step1: 'Check Vercel environment variables are set',
          step2: 'Verify DATABASE_URL points to Turso (libsql://...)',
          step3: 'Verify DATABASE_AUTH_TOKEN is set',
          step4: 'Redeploy without build cache',
          docs: 'See VERCEL-SETUP.md for help',
        },
      },
      { status: 500 }
    );
  }
}
