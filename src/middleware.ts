import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { verifyToken } from '@/lib/jwt';

/**
 * Middleware handles route protection and session verification.
 * Firebase Hosting ONLY supports the '__session' cookie name.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    // Skip protection for the login page itself
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Attempt to verify the admin token
    const payload = await verifyToken(session);
    
    // CRITICAL: Check for 'portal: admin' to distinguish from provider session cookies
    if (
      !payload ||
      payload.portal !== 'admin' ||
      (payload.role !== 'admin' && payload.role !== 'super_admin')
    ) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      // Clear potentially mismatched or invalid session
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
    
    // Provider sessions are standard Firebase Session Cookies handled by client SDKs
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*'],
};
