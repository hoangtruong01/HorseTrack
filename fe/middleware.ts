import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Hàm giải mã JWT thô tại Edge Runtime (chỉ lấy payload, không cần xác thực chữ ký vì đã được mã hóa an toàn ở Backend)
function decodeJwtPayload(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Kiểm tra xác thực các trang Dashboard bảo vệ
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

    // 2. Phân quyền vai trò (Role Gating - RBAC)
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.roles) {
      // Token lỗi hoặc không có quyền hạn
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      return res;
    }

    const userRoles: string[] = payload.roles;

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
  }

  // 3. Nếu đã đăng nhập, không cho phép truy cập lại màn hình đăng nhập/đăng ký
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/", request.url));
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
