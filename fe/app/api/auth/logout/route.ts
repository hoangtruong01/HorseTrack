import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Xóa cookies bằng cách thiết lập maxAge = 0 hoặc xóa trực tiếp
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return NextResponse.json({
      success: true,
      message: "Đăng xuất thành công.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Đăng xuất thất bại." },
      { status: 500 }
    );
  }
}
