import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Phiên đăng nhập đã hết hạn." },
        { status: 401 }
      );
    }

    const response = await fetch("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Nếu token không hợp lệ phía backend, xóa sạch cookie phía client
      const res = NextResponse.json(
        { message: data.message || "Xác thực phiên đăng nhập thất bại." },
        { status: response.status }
      );
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      return res;
    }

    return NextResponse.json({
      success: true,
      user: data.data || data, // Thích ứng cấu hình ResponseInterceptor của NestJS (trả về { success: true, data: user } hoặc user thô)
    });
  } catch {
    return NextResponse.json(
      { message: "Kết nối tới server thất bại." },
      { status: 500 }
    );
  }
}
