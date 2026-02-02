import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('__session')?.value;

  // Allow access to the login and pending pages themselves
  if (pathname.startsWith('/provider/login') || pathname.startsWith('/provider/pending')) {
    // If user has a session but tries to go to login, redirect to dashboard
    if (session && pathname.startsWith('/provider/login')) {
      return NextResponse.redirect(new URL('/provider/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect all other /provider routes
  if (pathname.startsWith('/provider')) {
    if (!session) {
      return NextResponse.redirect(new URL('/provider/login', req.url));
    }

    try {
      // Verify the session cookie. This checks for both validity and expiration.
      const decoded = await adminAuth.verifySessionCookie(session, true);
      
      // Check the provider's status in Firestore to ensure they are still active.
      const snap = await adminDb
        .collection('providers')
        .where('authUid', '==', decoded.uid)
        .limit(1)
        .get();

      if (snap.empty) {
        // If the provider document doesn't exist, invalidate the session and redirect.
        const response = NextResponse.redirect(new URL('/provider/login', req.url));
        response.cookies.delete('__session');
        return response;
      }

      const provider = snap.docs[0].data();

      // If the provider is not approved, redirect them to a pending page.
      if (provider.status !== 'approved') {
        return NextResponse.redirect(new URL('/provider/pending', req.url));
      }

      // If everything is valid, allow the request to proceed.
      return NextResponse.next();

    } catch (error) {
      // Session cookie is invalid or expired.
      const response = NextResponse.redirect(new URL('/provider/login', req.url));
      response.cookies.delete('__session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/provider/:path*'],
};
