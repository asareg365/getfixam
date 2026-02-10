import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Proxy handles route protection and session verification.
 * This is the preferred routing security layer for this environment.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (session) {
        try {
          const payload = await verifyToken(session);
          if (payload && payload.portal === 'admin') {
            return NextResponse.redirect(new URL('/admin', req.url));
          }
        } catch (e) {
          // Token invalid, allow login page
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

export default middleware;

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*'],
};
