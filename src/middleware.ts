// trigger rebuild
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Middleware for Next.js 15.
 * CRITICAL: This runs in the Edge Runtime. Do NOT import 'firebase-admin' here.
 */
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ----- ADMIN ROUTES PROTECTION -----
    if (pathname.startsWith('/admin')) {
        const token = req.cookies.get('admin_token')?.value;

        if (pathname === '/admin/login') {
            if (token) {
                try {
                    await jwtVerify(token, key);
                    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
                } catch (e) {
                    // Invalid token, allow login page
                }
            }
            return NextResponse.next();
        }

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        try {
            // Verify the JWT using Edge-compatible 'jose'
            await jwtVerify(token, key);
            // Full permission/lockout checks are handled inside the pages/actions via requireAdmin()
            return NextResponse.next();
        } catch (err) {
            const response = NextResponse.redirect(new URL('/admin/login', req.url));
            response.cookies.delete('admin_token');
            return response;
        }
    }

    // ----- PROVIDER ROUTES PROTECTION -----
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

        // We cannot verify the Firebase session cookie in the Edge middleware without an API call.
        // We let the Server Components/Actions in the provider directory handle validation.
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
  matcher: ['/provider/:path*', '/admin/:path*'],
};
