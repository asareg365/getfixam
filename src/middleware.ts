import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Middleware handles route protection and session verification for Admin and Provider routes.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_token');
      return response;
    }
    
    return NextResponse.next();
  }

  // 2. Protect Provider/Artisan Routes
  if (pathname.startsWith('/provider') && 
      pathname !== '/provider/login' && 
      pathname !== '/provider/pending' &&
      pathname !== '/provider/logins-disabled') {
    
    // Provider routes use the standard Firebase session cookie '__session'
    const session = req.cookies.get('__session')?.value;

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
