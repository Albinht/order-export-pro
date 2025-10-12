import { NextResponse } from 'next/server';

export async function GET() {
  // No initialization needed anymore - stores are handled by store-manager
  return NextResponse.json({ initialized: true, store: 'default-store' });
}
