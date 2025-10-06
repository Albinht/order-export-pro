import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('auth-session');
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isSetupPage = request.nextUrl.pathname === '/setup';
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // Allow setup pages and APIs
  if (isSetupPage || request.nextUrl.pathname.startsWith('/api/setup')) {
    return NextResponse.next();
  }
  
  // Skip API routes (except auth endpoints)
  if (isApiRoute && !request.nextUrl.pathname.startsWith('/api/auth')) {
    // Check auth for protected API routes
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access dashboard
  if (!session && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login page
  if (session && session.value === 'authenticated' && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/login',
  ],
};
