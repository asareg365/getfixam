import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Proxy handles route protection and session verification.
 * Standardized to distinguish between 'admin' and other portals.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    // Public admin routes
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Authentication check
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Authorization check
    const payload = await verifyToken(session);
    
    if (!payload || payload.portal !== 'admin') {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      // Clear invalid session to prevent infinite loops
      response.cookies.delete('__session');
      return response;
    }
    
    // Valid admin session
    return NextResponse.next();
  }

  // 2. Protect Provider Routes
  if (pathname.startsWith('/provider')) {
    const publicProviderRoutes = [
      '/provider/login',
      '/provider/pending',
      '/provider/logins-disabled'
    ];

    if (publicProviderRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.redirect(new URL('/provider/login', req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*'],
};
