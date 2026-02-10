import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Unified Routing Security Layer
 * Consolidates all access control logic to satisfy the server's 'proxy.ts' requirement.
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
    // Additional validation could be added here for provider specific claims
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*'],
};
