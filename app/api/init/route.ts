import { NextResponse } from 'next/server';
import { seedDefaultStore } from '@/lib/seed-store';

export async function GET() {
  try {
    const store = await seedDefaultStore();
    return NextResponse.json({ initialized: true, store: store?.id });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json({ initialized: false, error: 'Failed to initialize' });
  }
}
