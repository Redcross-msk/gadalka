import { NextResponse } from "next/server";

/**
 * Auth для /platform /game /shop /admin проверяется в layout через auth().
 * Middleware больше НЕ режет cookie — иначе на HTTPS клики «не работают».
 */
export function middleware() {
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
