import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token available." },
        { status: 401 }
      );
    }

    const response = await fetch("http://localhost:3000/api/v1/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Clear expired / invalid tokens
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return NextResponse.json(
        { message: data.message || "Failed to refresh token." },
        { status: response.status }
      );
    }

    // ResponseInterceptor might wrap payload as { success, data }
    const payloadData = data.data || data;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Set new tokens
    cookieStore.set("access_token", payloadData.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60, // 1 hour
    });

    cookieStore.set("refresh_token", payloadData.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({
      success: true,
      accessToken: payloadData.accessToken,
    });
  } catch {
    return NextResponse.json(
      { message: "Connection to server failed during token refresh." },
      { status: 500 }
    );
  }
}
