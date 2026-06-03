import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const response = await fetch("http://localhost:3000/api/v1/rankings/global/jockeys", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Lấy bảng xếp hạng jockey thất bại." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data || data,
    });
  } catch (err) {
    console.error("Lỗi kết nối tới Backend:", err);
    return NextResponse.json(
      { message: "Không thể kết nối đến server Backend." },
      { status: 500 }
    );
  }
}
