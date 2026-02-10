import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Proxy handles route protection and session verification.
 * Standardized to 'src/proxy.ts' per Next.js environment convention.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    // Allow access to the login page itself
    if (pathname === '/admin/login') {
      if (session) {
        try {
          const payload = await verifyToken(session);
          // If already a valid admin, skip login
          if (payload && payload.portal === 'admin') {
            return NextResponse.redirect(new URL('/admin', req.url));
          }
        } catch (e) {
          // Token invalid, stay on login page
        }
      }
      return NextResponse.next();
    }

    // Authentication check for protected admin routes
    if (!session) {
      console.log(`[Proxy] No session cookie found for ${pathname}. Redirecting to /admin/login.`);
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Authorization check
    try {
      const payload = await verifyToken(session);
      
      if (!payload || payload.portal !== 'admin') {
        console.log(`[Proxy] Unauthorized portal access: ${payload?.portal || 'none'} for ${pathname}.`);
        const response = NextResponse.redirect(new URL('/admin/login', req.url));
        // Clear invalid session
        response.cookies.delete('__session');
        return response;
      }
      
      // Valid admin session, proceed to page
      return NextResponse.next();
    } catch (err) {
      console.error(`[Proxy] Session verification failed for ${pathname}:`, err);
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
