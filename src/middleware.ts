
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session")?.value;

  const publicRoutes = [
    "/admin/login",
    "/provider/login",
    "/provider/pending",
    "/provider/logins-disabled",
  ];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (pathname.startsWith("/provider")) {
      return NextResponse.redirect(new URL("/provider/login", req.url));
    }
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session!, true);

    if (pathname.startsWith("/admin") && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (
      pathname.startsWith("/provider") &&
      decoded.role !== "provider" &&
      decoded.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.delete("session");
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/provider/:path*"],
};
