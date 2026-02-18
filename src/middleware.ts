import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Unified Routing Security Layer for FixAm Ghana.
 * Handles access control for Admin and Provider portals.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // 1. Admin Portal Protection
  if (pathname.startsWith('/admin')) {
    // Allow the login page to load
    if (pathname === '/admin/login') {
      if (session) {
        const payload = await verifyToken(session);
        if (payload && payload.portal === 'admin') {
          // If already logged in, skip the login page
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      }
      return NextResponse.next();
    }

    // Require session for all other /admin routes
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    const payload = await verifyToken(session);
    if (!payload || payload.portal !== 'admin') {
      // Invalid session or wrong portal: clear cookie and redirect
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('__session');
      return response;
    }

    return NextResponse.next();
  }

  // 2. Provider Portal Protection
  if (pathname.startsWith('/provider')) {
    const publicRoutes = ['/provider/login', '/provider/pending', '/provider/logins-disabled'];
    if (publicRoutes.includes(pathname)) return NextResponse.next();

    if (!session) {
      return NextResponse.redirect(new URL('/provider/login', req.url));
    }
    
    const payload = await verifyToken(session);
    if (!payload) {
        const response = NextResponse.redirect(new URL('/provider/login', req.url));
        response.cookies.delete('__session');
        return response;
    }
    
    // Note: We currently allow any valid session to access the provider portal base,
    // as provider IDs are used as the UID.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/provider/:path*',
  ],
};
