import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Middleware handles route protection and session verification.
 * Optimized to remove slow internal fetch calls that cause login delays.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect the admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      // Verify JWT token using Edge-compatible jose library
      await jwtVerify(token, key);
      return NextResponse.next();
    } catch (e) {
      console.warn("Admin token validation failed:", e);
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // Pass-through for all other routes
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all admin and provider routes
  matcher: ['/admin/:path*', '/provider/:path*'],
};
