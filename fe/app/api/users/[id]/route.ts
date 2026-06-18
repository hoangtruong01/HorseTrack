import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Cập nhật thông tin thất bại." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Lỗi cập nhật user tới Backend:", err);
    return NextResponse.json(
      { message: "Không thể kết nối đến server Backend." },
      { status: 500 }
    );
  }
}
