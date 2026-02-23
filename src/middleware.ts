import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get('__session')?.value

  // ADMIN PROTECTION
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    try {
      const payload = await verifyToken(session)
      if (!payload || payload.portal !== 'admin') {
        throw new Error('Unauthorized')
      }
      return NextResponse.next()
    } catch {
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      res.cookies.delete('__session')
      return res
    }
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

    try {
      const payload = await verifyToken(session)
      if (!payload || (payload.portal !== 'provider' && payload.portal !== 'admin')) {
        throw new Error('Unauthorized')
      }
      return NextResponse.next()
    } catch {
      const res = NextResponse.redirect(new URL('/provider/login', req.url))
      res.cookies.delete('__session')
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/provider/:path*'],
}
