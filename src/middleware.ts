import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'this-is-a-super-secret-key-that-should-be-in-an-env-file';

const key = new TextEncoder().encode(SECRET_KEY);

async function areProviderLoginsDisabled(req: NextRequest): Promise<boolean> {
  try {
    // We must call our internal API route using an absolute URL.
    const host = req.headers.get('host')!;
    const protocol = req.nextUrl.protocol;
    const url = `${protocol}//${host}/api/settings/provider-logins-disabled`;
    
    const res = await fetch(url, {
      headers: {
        // Forward necessary headers
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`Middleware: API call to check settings failed with status: ${res.status}`);
      // Fail-safe: if the check fails, assume logins are disabled to be safe.
      return true;
    }

    const data = await res.json();
    return data.isDisabled === true;

  } catch (error) {
    console.error("Middleware: Error calling API to check settings:", error);
    // Fail-safe: if any exception occurs, assume logins are disabled.
    return true;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if provider logins are disabled
  if (pathname.startsWith('/provider') && !pathname.startsWith('/provider/logins-disabled')) {
    const loginsDisabled = await areProviderLoginsDisabled(req);
    if (loginsDisabled) {
      return NextResponse.redirect(new URL('/provider/logins-disabled', req.url));
    }
  }

  // Protect the admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      await jwtVerify(token, key);
      // Token is valid, continue
      return NextResponse.next();
    } catch (e) {
      console.warn("Admin token validation failed:", e);
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Default pass-through
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all admin and provider routes
  matcher: ['/admin/:path*', '/provider/:path*'],
};
