import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow access to login and pending pages
  if (pathname.startsWith('/provider/login') || pathname.startsWith('/provider/pending')) {
    return NextResponse.next();
  }

  // All other /provider routes are protected
  if (pathname.startsWith('/provider')) {
    const session = req.cookies.get('__session')?.value;
    if (!session) {
      return NextResponse.redirect(new URL('/provider/login', req.url));
    }

    try {
      // Verify the session cookie. This checks for both validity and expiration.
      const decoded = await admin.auth().verifySessionCookie(session, true);
      
      // Check the provider's status in Firestore to ensure they are still active.
      const snap = await admin.firestore()
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
      if (provider.status !== 'approved' || provider.verified !== true) {
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
