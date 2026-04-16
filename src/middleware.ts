
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  // Redirect non-www to www in production
  if (req.headers.get("host") === "getfixam.com") {
    return NextResponse.redirect(
      `https://www.getfixam.com${req.nextUrl.pathname}`,
      301
    );
  }
  
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("__session")?.value;

  // Define routes that do not require authentication
  const publicRoutes = [
    "/admin/login",
    "/provider/login",
    "/provider/pending",
    "/provider/logins-disabled",
    "/api/",
    "/_next",
    "/static",
    "/favicon",
    "/logo",
  ];

  if (publicRoutes.some(route => pathname.startsWith(route) || pathname === "/")) {
    return NextResponse.next();
  }

  // If no session exists, redirect to appropriate login
  if (!session || session === "undefined" || session === "") {
    const redirectUrl = pathname.startsWith("/provider")
      ? "/provider/login"
      : "/admin/login";
    
    // Only redirect if we are trying to access protected paths
    if (pathname.startsWith("/admin") || pathname.startsWith("/provider")) {
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  try {
    // Verify the session cookie
    const decoded = await adminAuth.verifySessionCookie(session!, true);

    // Admin Route Protection
    if (pathname.startsWith("/admin") && 
      decoded.role !== "admin" && 
      decoded.role !== "super_admin") {
      console.log("[Middleware] Denied: Not an admin", decoded.uid);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Provider Route Protection
    if (pathname.startsWith("/provider") &&
      decoded.role !== "provider" &&
      decoded.role !== "admin" &&
      decoded.role !== "super_admin"
    ) {
      console.log("[Middleware] Denied: Not a provider", decoded.uid);
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (e) {
    console.log("[Middleware] Session verification failed, clearing cookie.");
    const redirectUrl = pathname.startsWith("/provider")
      ? "/provider/login"
      : "/admin/login";
    
    const res = NextResponse.redirect(new URL(redirectUrl, req.url));
    res.cookies.delete("__session");
    return res;
  }
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/provider/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|placeholder).*)",
  ],
};
