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
    if (pathname === '/admin/login') {
      if (session) {
        try {
          const payload = await verifyToken(session);
          if (payload && payload.portal === 'admin') {
            return NextResponse.redirect(new URL('/admin', req.url));
          }
        } catch (e) {
          // Invalid token, allow access to login page
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
    
    // Optional: Basic validation of session for provider portal
    try {
        const payload = await verifyToken(session);
        if (!payload) {
            const response = NextResponse.redirect(new URL('/provider/login', req.url));
            response.cookies.delete('__session');
            return response;
        }
    } catch (e) {
        return NextResponse.redirect(new URL('/provider/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. logo.png)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
