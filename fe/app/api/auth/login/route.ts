import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const response = await fetch("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Email hoặc mật khẩu không chính xác." },
        { status: response.status }
      );
    }

    const payloadData = data.data || data;

    // Ghi nhận tokens vào HttpOnly cookies
    const cookieStore = await cookies();
    
    // Cookie Options an toàn
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Đặt Access Token (1 giờ) và Refresh Token (30 ngày)
    cookieStore.set("access_token", payloadData.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60, // 1 hour in seconds
    });

    cookieStore.set("refresh_token", payloadData.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    // Trả về thông tin user thô cho client (không kèm token ra ngoài body)
    return NextResponse.json({
      success: true,
      user: payloadData.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Kết nối tới server thất bại." },
      { status: 500 }
    );
  }
}
