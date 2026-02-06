
// trigger rebuild
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/admin')) {
        const token = req.cookies.get('admin_token')?.value;

        if (pathname === '/admin/login') {
            if (token) {
                try {
                    await jwtVerify(token, key);
                    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
                } catch (e) { }
            }
            return NextResponse.next();
        }

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        try {
            await jwtVerify(token, key);
            return NextResponse.next();
        } catch (err) {
            const response = NextResponse.redirect(new URL('/admin/login', req.url));
            response.cookies.delete('admin_token');
            return response;
        }
    }

    if (pathname.startsWith('/provider')) {
        const session = req.cookies.get('__session')?.value;

        if (pathname === '/provider/login' || pathname === '/provider/pending') {
            if (session && pathname === '/provider/login') {
                return NextResponse.redirect(new URL('/provider/dashboard', req.url));
            }
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
  matcher: ['/provider/:path*', '/admin/:path*'],
};
