import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/security/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const options = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };
    
    const result = await getAuditLogs(options);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
