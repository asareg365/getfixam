// trigger rebuild
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const SECRET = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';


async function handleAdminRoutes(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('admin_token')?.value;

    // Allow access to the login page itself
    if (pathname === '/admin/login') {
        if (token) {
            try {
                // If token is valid, redirect away from login page
                jwt.verify(token, SECRET);
                return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            } catch (e) {
                // Invalid token, allow access to login page
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    // From here, all routes require a valid token
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
    }

    try {
        const decoded = jwt.verify(token, SECRET) as JwtPayload;
        if (!decoded.email) {
            throw new Error('Invalid token: email missing.');
        }
        
        // Re-validate against Firestore to ensure admin is still active
        if (adminDb) {
            const adminSnap = await adminDb.collection('admins').where('email', '==', decoded.email).where('active', '==', true).limit(1).get();
            if (adminSnap.empty) {
                throw new Error('Admin not found or inactive.');
            }

            // Check for system lockout. This is a DB read in middleware.
            const settingsSnap = await adminDb.collection('system_settings').doc('admin').get();
            if (settingsSnap.exists && settingsSnap.data()?.adminLocked === true) {
                // Allow access ONLY to the security page to disable the lock
                if (!pathname.startsWith('/admin/settings/security')) {
                    const url = req.nextUrl.clone();
                    url.pathname = '/admin/settings/security';
                    return NextResponse.redirect(url);
                }
            }
        }
        
        return NextResponse.next();

    } catch (error) {
        // Invalid token, redirect to login and clear the bad cookie
        const url = req.nextUrl.clone();
        url.pathname = '/admin/login';
        const response = NextResponse.redirect(url);
        response.cookies.delete('admin_token');
        return response;
    }
}


async function handleProviderRoutes(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const session = req.cookies.get('__session')?.value;

    // Allow access to login and the static pending page
    if (pathname === '/provider/login' || pathname === '/provider/pending') {
        if (session && pathname === '/provider/login') {
          return NextResponse.redirect(new URL('/provider/dashboard', req.url));
        }
        return NextResponse.next();
    }

    // From here, all routes require a valid session
    if (!session) {
        return NextResponse.redirect(new URL('/provider/login', req.url));
    }

    try {
        if (adminAuth && adminDb) {
            const decoded = await adminAuth.verifySessionCookie(session, true);
            
            const snap = await adminDb.collection('providers').where('authUid', '==', decoded.uid).limit(1).get();

            if (snap.empty) {
                const response = NextResponse.redirect(new URL('/provider/login', req.url));
                response.cookies.delete('__session');
                return response;
            }

            const provider = snap.docs[0].data();

            // If provider is not approved and they try to access anything other than the dashboard,
            // redirect them to the dashboard where their status is displayed.
            if (provider.status !== 'approved' && pathname !== '/provider/dashboard') {
                return NextResponse.redirect(new URL('/provider/dashboard', req.url));
            }
        }

        return NextResponse.next();

    } catch (error) {
        const response = NextResponse.redirect(new URL('/provider/login', req.url));
        response.cookies.delete('__session');
        return response;
    }
}


export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/admin')) {
        return handleAdminRoutes(req);
    }

    if (pathname.startsWith('/provider')) {
        return handleProviderRoutes(req);
    }

    return NextResponse.next();
}

export const config = {
  matcher: ['/provider/:path*', '/admin/:path*'],
};
