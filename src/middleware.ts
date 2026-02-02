// trigger rebuild
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/jwt';

async function handleAdminRoutes(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('admin_token')?.value;

    if (pathname === '/admin/login') {
        if (token) {
            const decoded = await verifyToken(token);
            if (decoded) {
                return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            }
        }
        return NextResponse.next();
    }

    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.email) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin/login';
        const response = NextResponse.redirect(url);
        response.cookies.delete('admin_token');
        return response;
    }

    // Re-validate against Firestore if available (Runtime check)
    if (adminDb) {
        try {
            const adminSnap = await adminDb.collection('admins')
                .where('email', '==', decoded.email)
                .where('active', '==', true)
                .limit(1)
                .get();

            if (adminSnap.empty) {
                throw new Error('Admin inactive');
            }

            const settingsSnap = await adminDb.collection('system_settings').doc('admin').get();
            if (settingsSnap.exists && settingsSnap.data()?.adminLocked === true) {
                if (!pathname.startsWith('/admin/settings/security')) {
                    const url = req.nextUrl.clone();
                    url.pathname = '/admin/settings/security';
                    return NextResponse.redirect(url);
                }
            }
        } catch (e) {
            const url = req.nextUrl.clone();
            url.pathname = '/admin/login';
            const response = NextResponse.redirect(url);
            response.cookies.delete('admin_token');
            return response;
        }
    }
    
    return NextResponse.next();
}

async function handleProviderRoutes(req: NextRequest) {
    const { pathname } = req.nextUrl;
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

    if (adminAuth && adminDb) {
        try {
            const decoded = await adminAuth.verifySessionCookie(session, true);
            const snap = await adminDb.collection('providers').where('authUid', '==', decoded.uid).limit(1).get();

            if (snap.empty) {
                const response = NextResponse.redirect(new URL('/provider/login', req.url));
                response.cookies.delete('__session');
                return response;
            }

            const provider = snap.docs[0].data();
            if (provider.status !== 'approved' && pathname !== '/provider/dashboard') {
                return NextResponse.redirect(new URL('/provider/dashboard', req.url));
            }
        } catch (error) {
            const response = NextResponse.redirect(new URL('/provider/login', req.url));
            response.cookies.delete('__session');
            return response;
        }
    }

    return NextResponse.next();
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
