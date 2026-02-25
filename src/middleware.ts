import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'

async function verifySession(session: string | null | undefined) {
  if (!session) return null;
  try {
    const decodedToken = await getAdminAuth().verifySessionCookie(session, true /** checkRevoked */);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying session:", error);
    // Session cookie is invalid or revoked.
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get('__session')?.value

  const decodedToken = await verifySession(session);
  console.log("---- MIDDLEWARE DEBUG ----");
  console.log("Has Session:", !!session);
  console.log("Decoded Token:", decodedToken);
  console.log("--------------------------");

  // MIGRATION ROUTE PROTECTION
  if (pathname.startsWith('/api/admin/migrate-providers')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: No session cookie found.' }, { status: 401 });
    }

    if (!decodedToken || decodedToken.portal !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    return NextResponse.next()
  }

  // ADMIN PROTECTION
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    if (!decodedToken || decodedToken.portal !== 'admin') {
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      res.cookies.delete('__session')
      return res
    }

    return NextResponse.next()
  }

  // PROVIDER PROTECTION
  if (pathname.startsWith('/provider')) {
    const publicRoutes = [
      '/provider/login',
      '/provider/pending',
      '/provider/logins-disabled'
    ]

    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    if (!session) {
      return NextResponse.redirect(new URL('/provider/login', req.url))
    }

    if (!decodedToken || (decodedToken.role !== 'provider' && decodedToken.role !== 'admin')) {
      const res = NextResponse.redirect(new URL('/provider/login', req.url))
      res.cookies.delete('__session')
      return res
    }
    
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const runtime = 'nodejs';

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*', '/api/admin/migrate-providers'],
}
