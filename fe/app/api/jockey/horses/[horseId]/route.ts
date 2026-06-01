import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ horseId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const { horseId } = await params;

    const response = await fetch(`http://localhost:3000/api/v1/horses/${horseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Lấy thông tin chi tiết chiến mã thất bại." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data || data,
    });
  } catch (err) {
    console.error("Lỗi kết nối tới Backend:", err);
    const errorMessage = err instanceof Error ? err.message : "Không thể kết nối đến server Backend.";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
