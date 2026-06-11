import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    try {
      const response = await fetch("http://localhost:3000/api/v1/notifications/my-notifications?page=1&limit=50", {
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
          notifications: resData,
        });
      }
    } catch (backendError) {
      console.warn("Backend sập hoặc lỗi, fallback dùng mock notifications:", backendError);
    }

    return NextResponse.json({
      success: true,
      notifications: Notification,
    });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message || "Lấy thông báo thất bại" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (all === "true") {
      // Đánh dấu tất cả đã đọc
      const response = await fetch("http://localhost:3000/api/v1/notifications/read-all", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      }
    } else if (id) {
      // Đánh dấu một thông báo đã đọc
      const response = await fetch(`http://localhost:3000/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message || "Thao tác thất bại" },
      { status: 500 }
    );
  }
}
