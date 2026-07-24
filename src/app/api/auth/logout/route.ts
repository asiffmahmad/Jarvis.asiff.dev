import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWT_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(JWT_COOKIE_NAME);

  return NextResponse.json({ message: "Logged out successfully" });
}
