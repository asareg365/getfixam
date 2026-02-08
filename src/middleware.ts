import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Middleware handles route protection and session verification.
 * Firebase Hosting ONLY supports the '__session' cookie name.
 * 
 * We use the same cookie name for both Admins and Artisans but 
 * distinguish them by the content/verification of the token.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Admins use our custom jose-signed JWT. We try to verify it.
    const payload = await verifyToken(session);
    
    // If it's not our JWT or the role isn't admin/super_admin, redirect
    if (!payload || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      // If we have a session but it's not an admin session (e.g. it's an artisan session),
      // we clear it and redirect to admin login to prevent cross-portal confusion.
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('__session');
      return response;
    }
    
    return NextResponse.next();
  }

  // 2. Protect Provider/Artisan Routes
  if (pathname.startsWith('/provider') && 
      pathname !== '/provider/login' && 
      pathname !== '/provider/pending' &&
      pathname !== '/provider/logins-disabled') {
    
    if (!session) {
      return NextResponse.redirect(new URL('/provider/login', req.url));
    }
    
    // Note: Artisan sessions are standard Firebase Session Cookies. 
    // In Edge middleware, we primarily check for existence. 
    // Deep verification happens in the layout/components using the Admin SDK.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*'],
};
