import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/admin/:path*',
};

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('adminSession');
  const { pathname } = req.nextUrl;

  // If user is authenticated and trying to access the login page,
  // redirect them to the dashboard.
  if (session && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // The main protection is now handled in the /admin/layout.tsx file.
  // This middleware is now primarily for convenience (redirecting away from login).
  // However, we can keep the check for non-login pages as a backup.
  if (!session && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}
