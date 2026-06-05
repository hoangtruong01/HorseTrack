import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function decodeJwtPayload(token: string): any {
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
  } catch (err) {
    return null;
  }
}

// Fallback mock notifications
const mockNotifications = [
  {
    _id: "notif-1",
    title: "Chào mừng",
    body: "Chào mừng bạn đến với hệ thống HorseTrack!",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "notif-2",
    title: "Kết quả đua",
    body: "Cuộc đua số 1 đã có kết quả chính thức.",
    isRead: false,
    createdAt: new Date().toISOString(),
  }
];

export async function GET(request: Request) {
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

    // Fallback
    return NextResponse.json({
      success: true,
      notifications: mockNotifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Lấy thông báo thất bại" },
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
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Thao tác thất bại" },
      { status: 500 }
    );
  }
}
