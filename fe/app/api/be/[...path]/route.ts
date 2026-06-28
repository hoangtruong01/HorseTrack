import { cookies } from "next/headers";

const getBackendBase = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";
  return raw.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "") + "/api/v1";
};

async function handleProxy(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const { path } = await context.params;
  const url = new URL(req.url);
  const backendUrl = `${getBackendBase()}/${path.join("/")}${url.search}`;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;

  let body: string | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  let beRes: Response;
  try {
    beRes = await fetch(backendUrl, { method: req.method, headers, body });
  } catch (err) {
    console.error("BE proxy error:", err);
    return new Response(
      JSON.stringify({ message: "Không thể kết nối đến server Backend." }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  // Forward verbatim để api-client giữ nguyên logic unwrap envelope { success, data, meta }
  const text = await beRes.text();
  return new Response(text, {
    status: beRes.status,
    headers: {
      "content-type": beRes.headers.get("content-type") ?? "application/json",
    },
  });
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PATCH,
  handleProxy as PUT,
  handleProxy as DELETE,
};
