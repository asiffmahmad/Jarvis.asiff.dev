import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, JWT_COOKIE_NAME } from "@/lib/auth/jwt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifySession(token);
    if (payload) {
      return NextResponse.json({
        user: { id: payload.userId, username: payload.username, role: payload.role },
      });
    }
  }

  // Fallback: Check if there's a valid Google NextAuth session
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user?.email) {
      const prisma = (await import("@/lib/db/prisma")).default;
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (dbUser) {
        return NextResponse.json({
          user: { id: dbUser.id, username: dbUser.email, role: dbUser.role },
        });
      }
    }
  } catch (err) {
    console.error("NextAuth session check error:", err);
  }

  return NextResponse.json({ user: null });
}
