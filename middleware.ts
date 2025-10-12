import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge-compatible middleware for Cloudflare Pages
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('auth-session');
  
  // Define route patterns
  const publicRoutes = ['/', '/login', '/setup', '/simple-setup'];
  const protectedRoutes = ['/dashboard', '/api/orders', '/api/export'];
  const authRoutes = ['/api/auth', '/api/setup'];
  
  // Allow public routes
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }
  
  // Allow auth/setup API routes
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check if it's a protected route
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtected) {
    // Check authentication
    if (!session || session.value !== 'authenticated') {
      // For API routes, return JSON error
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // For pages, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Redirect authenticated users away from login
  if (pathname === '/login' && session?.value === 'authenticated') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
