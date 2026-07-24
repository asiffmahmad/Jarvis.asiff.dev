import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { signSession, JWT_COOKIE_NAME, DEFAULT_SESSION_MAX_AGE, REMEMBER_ME_MAX_AGE, type SessionPayload } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const { username, password, rememberMe } = await request.json();

    if (
      !username ||
      !password ||
      username !== serverEnv.adminUsername ||
      password !== serverEnv.adminPassword
    ) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const payload: SessionPayload = {
      userId: "admin-1",
      username: username,
      role: "admin",
    };

    const maxAge = rememberMe ? REMEMBER_ME_MAX_AGE : DEFAULT_SESSION_MAX_AGE;
    const token = await signSession(payload, maxAge);

    const cookieStore = await cookies();
    cookieStore.set(JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: serverEnv.isProduction,
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return NextResponse.json({
      message: "Authenticated successfully",
      user: { id: payload.userId, username: payload.username, role: payload.role },
    });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
