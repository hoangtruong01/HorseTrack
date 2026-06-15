import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");

    if (tournamentId) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/race-results/tournament/${tournamentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { message: data.message || "Lấy kết quả thi đấu thất bại." },
          { status: response.status }
        );
      }
      return NextResponse.json({ success: true, data: data.data || data });
    } else {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments?limit=100`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { message: data.message || "Lấy danh sách giải đấu thất bại." },
          { status: response.status }
        );
      }
      return NextResponse.json({ success: true, data: data.data || data });
    }
  } catch (err) {
    console.error("Lỗi kết nối tới Backend:", err);
    return NextResponse.json(
      { message: "Không thể kết nối đến server Backend." },
      { status: 500 }
    );
  }
}
