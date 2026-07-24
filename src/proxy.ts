import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (authentication routes)
     * - login (login page)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("jarvis_session")?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      throw new Error("AUTH_SECRET is missing");
    }

    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });

    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  if (request.nextUrl.pathname !== "/") {
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  }
  return NextResponse.redirect(url);
}
