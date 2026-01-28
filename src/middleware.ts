import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const config = {
  matcher: '/admin/:path*',
};

export async function middleware(req: NextRequest) {
  const session = await getSession();
  const { pathname } = req.nextUrl;

  // If user is not authenticated and trying to access a protected route,
  // redirect them to the login page.
  if (!session && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // If user is authenticated and trying to access the login page,
  // redirect them to the dashboard.
  if (session && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
}
