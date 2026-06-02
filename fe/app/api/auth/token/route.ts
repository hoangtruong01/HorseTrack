import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/** Expose access_token to the api-client running in client-side code via fetch("/api/auth/token") */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? null;
  return NextResponse.json({ token });
}
