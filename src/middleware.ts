import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Unified Routing Security Layer for FixAm Ghana.
 * Consolidates all access control logic for Admin and Provider portals.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // 1. Admin Portal Protection
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (session) {
        try {
          const payload = await verifyToken(session);
          if (payload && payload.portal === 'admin') {
            // If already logged in as admin, skip login page
            return NextResponse.redirect(new URL('/admin', req.url));
          }
        } catch (e) {
          // Token invalid, allow landing on login page
        }
      }
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      const payload = await verifyToken(session);
      if (!payload || payload.portal !== 'admin') {
        const response = NextResponse.redirect(new URL('/admin/login', req.url));
        response.cookies.delete('__session');
        return response;
      }
      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('__session');
      return response;
    }
  }

  // 2. Provider Portal Protection
  if (pathname.startsWith('/provider')) {
    const publicRoutes = ['/provider/login', '/provider/pending', '/provider/logins-disabled'];
    if (publicRoutes.includes(pathname)) return NextResponse.next();

    if (!session) {
      return NextResponse.redirect(new URL('/provider/login', req.url));
    }
    
    try {
        const payload = await verifyToken(session);
        // Providers can be checked here if we add specific roles later
        if (!payload) {
            const response = NextResponse.redirect(new URL('/provider/login', req.url));
            response.cookies.delete('__session');
            return response;
        }
    } catch (e) {
        const response = NextResponse.redirect(new URL('/provider/login', req.url));
        response.cookies.delete('__session');
        return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/provider/:path*',
  ],
};
