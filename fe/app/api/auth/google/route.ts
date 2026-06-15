import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Xác thực tài khoản Google thất bại." },
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

    // Trả về thông tin user thô cho client
    return NextResponse.json({
      success: true,
      user: payloadData.user,
    });
  } catch {
    return NextResponse.json(
      { message: "Kết nối tới server thất bại." },
      { status: 500 }
    );
  }
}
