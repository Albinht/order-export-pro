import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Ensure database exists
    try {
      const dbPath = path.join(process.cwd(), 'prisma', 'database.db');
      if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      }
      
      // Try to initialize database if needed
      if (!fs.existsSync(dbPath)) {
        console.log('Initializing database...');
        try {
          execSync('npx prisma db push --skip-generate', {
            env: { ...process.env, DATABASE_URL: 'file:./prisma/database.db' }
          });
        } catch (e) {
          console.log('Database initialization warning:', e);
        }
      }
    } catch (dbError) {
      console.error('Database setup error:', dbError);
    }

    const { name, domain, platform, accessToken, consumerKey, consumerSecret } = await request.json();

    // Validate input
    if (!name || !domain || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (platform === 'shopify' && !accessToken) {
      return NextResponse.json(
        { error: 'Access token is required for Shopify' },
        { status: 400 }
      );
    }

    if (platform === 'woocommerce' && (!consumerKey || !consumerSecret)) {
      return NextResponse.json(
        { error: 'Consumer key and secret are required for WooCommerce' },
        { status: 400 }
      );
    }

    // Create the store
    const store = await prisma.store.create({
      data: {
        name,
        domain,
        platform,
        accessToken: platform === 'shopify' ? accessToken : null,
        consumerKey: platform === 'woocommerce' ? consumerKey : null,
        consumerSecret: platform === 'woocommerce' ? consumerSecret : null,
        isActive: true
      }
    });

    // Create admin user if it doesn't exist
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('1n$$2O%n2$f2', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          passwordHash: hashedPassword
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Setup complete!',
      storeId: store.id
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to complete setup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
