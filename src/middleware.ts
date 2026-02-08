import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Middleware handles route protection and session verification.
 * Firebase Hosting ONLY supports the '__session' cookie name.
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
    
    // DEBUG: Confirm the payload matches the expected structure
    console.log('Admin payload:', payload);

    // If token is invalid OR not an admin token, redirect and clear session
    if (
      !payload ||
      payload.portal !== 'admin' ||
      (payload.role !== 'admin' && payload.role !== 'super_admin')
    ) {
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
    
    // Artisan sessions are standard Firebase Session Cookies. 
    // They won't have the 'portal: admin' field, which naturally keeps them out of admin routes.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*'],
};
