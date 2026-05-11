import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host");

  // Redirect non-www to www in production
  if (host === "getfixam.com") {
    return NextResponse.redirect(
      `https://www.getfixam.com${pathname}`,
      301
    );
  }

  // Public routes
  const publicRoutes = [
    "/",
    "/about",
    "/browse",
    "/privacy",
    "/terms",
    "/admin/login",
    "/provider/login",
    "/provider/pending",
    "/provider/logins-disabled",
  ];

  // Allow public routes
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo")
  ) {
    return NextResponse.next();
  }

  // Get session cookie
  const session = req.cookies.get("__session")?.value;

  // Protect admin/provider routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isProviderRoute = pathname.startsWith("/provider");

  // No session → redirect to login
  if (!session) {
    if (isAdminRoute) {
      return NextResponse.redirect(
        new URL("/admin/login", req.url)
      );
    }

    if (isProviderRoute) {
      return NextResponse.redirect(
        new URL("/provider/login", req.url)
      );
    }

    return NextResponse.next();
  }

  try {
    // Verify Firebase session cookie
    const decoded = await adminAuth.verifySessionCookie(
      session,
      true
    );

    // Admin access
    if (
      isAdminRoute &&
      decoded.role !== "admin" &&
      decoded.role !== "super_admin"
    ) {
      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }

    // Provider access
    if (
      isProviderRoute &&
      decoded.role !== "provider" &&
      decoded.role !== "admin" &&
      decoded.role !== "super_admin"
    ) {
      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Session verification failed:", error);

    const loginUrl = isProviderRoute
      ? "/provider/login"
      : "/admin/login";

    const response = NextResponse.redirect(
      new URL(loginUrl, req.url)
    );

    response.cookies.delete("__session");

    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/provider/:path*"],
};