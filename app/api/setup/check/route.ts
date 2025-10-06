import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if any store exists
    const storeCount = await prisma.store.count();
    
    // Check if admin user exists
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      setupComplete: storeCount > 0,
      hasUser: userCount > 0,
      hasStore: storeCount > 0
    });
  } catch (error) {
    // Database might not be initialized yet
    return NextResponse.json({
      setupComplete: false,
      hasUser: false,
      hasStore: false
    });
  }
}
