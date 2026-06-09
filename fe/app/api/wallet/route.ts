import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
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
  } catch {
    return null;
  }
}

// Fallback mock balances
const mockBalances: Record<string, number> = {
  "owner@horsetrack.local": 15000,
  "jockey@horsetrack.local": 8500,
  "referee@horsetrack.local": 0,
  "spectator@horsetrack.local": 3200,
  "admin@horsetrack.local": 99999,
  "counter@horsetrack.local": 50000,
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const payload = decodeJwtPayload(token);
    const email = (payload?.email as string) || "";

    try {
      const response = await fetch("http://localhost:3000/api/v1/wallet/history?page=1&limit=1", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const resData = data.data || data;
        return NextResponse.json({
          success: true,
          points: resData.points ?? 0,
          balance: resData.balance ?? 0,
        });
      }
    } catch (backendError) {
      console.warn("Backend sập hoặc lỗi, fallback dùng mock wallet balance:", backendError);
    }

    // Fallback sang mock data nếu backend không phản hồi hoặc lỗi
    const points = mockBalances[email] ?? 0;
    return NextResponse.json({
      success: true,
      points,
      balance: 0,
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message || "Lấy thông tin ví thất bại" },
      { status: 500 }
    );
  }
}
