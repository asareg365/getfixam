'use server';

import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/admin/:path*',
};

export function middleware(req: NextRequest) {
  const session = req.cookies.get('adminSession');
  const { pathname } = req.nextUrl;

  // If user is trying to access the login page
  if (pathname === '/admin/login') {
    // If they are already logged in, redirect to dashboard
    if (session) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    // Otherwise, allow them to see the login page
    return NextResponse.next();
  }

  // For any other admin page
  // If they are not logged in, redirect to login page
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // Otherwise, allow access
  return NextResponse.next();
}
