import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED = ["/platform", "/game", "/shop"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? "gadalka-dev-secret-change-me-32",
  });

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!token?.id) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("auth", "required");
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!needsAuth) return NextResponse.next();

  if (!token?.id) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "required");
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/platform/:path*",
    "/game/:path*",
    "/shop/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
