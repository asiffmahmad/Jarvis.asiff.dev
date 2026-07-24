import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, JWT_COOKIE_NAME } from "@/lib/auth/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: { id: payload.userId, username: payload.username, role: payload.role },
  });
}
