import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Tải tập tin lên thất bại." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.url,
      publicId: data.publicId,
    });
  } catch (err) {
    console.error("Lỗi upload tới Backend:", err);
    const errorMessage = err instanceof Error ? err.message : "Không thể kết nối đến server Backend.";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
