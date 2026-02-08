import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Proxy handles route protection and session verification.
 * Strictly distinguishes between 'admin' and other portals using the 'portal' claim.
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
    try {
      const payload = await verifyToken(session);
      
      // Strict check for portal and role
      if (!payload || payload.portal !== 'admin' || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
        const response = NextResponse.redirect(new URL('/admin/login', req.url));
        response.cookies.delete('__session');
        return response;
      }
      
      // Valid admin session
      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('__session');
      return response;
    }
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
