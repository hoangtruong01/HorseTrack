import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function handleProxy(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
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

    const { path } = await context.params;
    const backendPath = path.join("/");
    
    // Construct the backend URL with query params
    const url = new URL(req.url);
    const backendUrl = `http://localhost:3000/api/v1/${backendPath}${url.search}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const contentType = req.headers.get("content-type");
    if (contentType) {
      headers["content-type"] = contentType;
    }

    // Read the body if it exists
    let body: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Yêu cầu thất bại." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data || data,
    });
  } catch (err: any) {
    console.error("Lỗi proxy kết nối tới Backend:", err);
    return NextResponse.json(
      { message: err.message || "Không thể kết nối đến server Backend." },
      { status: 500 }
    );
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PATCH,
  handleProxy as PUT,
  handleProxy as DELETE,
};
