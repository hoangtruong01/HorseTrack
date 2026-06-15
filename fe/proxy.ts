import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "horsetrack_jwt_secret_key_2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isDashboardRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/jockey") ||
    pathname.startsWith("/referee");

  if (isDashboardRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 1. Verify token signature and expiration status
      const { payload } = await jwtVerify(token, secretKey);
      
      if (!payload || !payload.roles || !Array.isArray(payload.roles)) {
        throw new Error("Invalid token structure");
      }

      const userRoles = payload.roles as string[];

      // 2. Role Gating (RBAC)
      if (pathname.startsWith("/admin") && !userRoles.includes("admin")) {
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
      if (pathname.startsWith("/owner") && !userRoles.includes("owner")) {
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
      if (pathname.startsWith("/jockey") && !userRoles.includes("jockey")) {
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
      if (pathname.startsWith("/referee") && !userRoles.includes("referee")) {
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
    } catch {
      // Token expired, signature mismatch, or invalid
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      return res;
    }
  }

  // 3. If logged in with valid token, prevent access to login/register pages
  if ((pathname === "/login" || pathname === "/register") && token) {
    try {
      await jwtVerify(token, secretKey);
      return NextResponse.redirect(new URL("/", request.url));
    } catch {
      // Token invalid, let them access login/register but clear cookies
      const res = NextResponse.next();
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/owner/:path*",
    "/jockey/:path*",
    "/referee/:path*",
    "/login",
    "/register",
  ],
};
