'use server';

import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/admin/:path*',
};

export function middleware(req: NextRequest) {
  const session = req.cookies.get('adminSession');
  const { pathname } = req.nextUrl;

  // Add the pathname to the request headers for use in server components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-next-pathname', pathname);

  if (session && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // NOTE: The primary protection is in the layout, which will redirect if no session.
  // This middleware is mainly for redirecting logged-in users away from login.

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
