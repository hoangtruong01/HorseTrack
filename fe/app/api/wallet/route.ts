import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/wallet/history?page=1&limit=1`,
      { method: "GET", headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: data.message || "Lấy thông tin ví thất bại" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const resData = data.data || data;
    return NextResponse.json({
      success: true,
      points: resData.points ?? 0,
      balance: 0,
    });
  } catch (err) {
    console.error("Wallet route error:", err);
    return NextResponse.json(
      { message: "Không thể kết nối đến server Backend." },
      { status: 502 }
    );
  }
}
