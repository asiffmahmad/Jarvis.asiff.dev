import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { serverEnv } from "@/lib/env";
import { createLogger } from "@/lib/logger";

const log = createLogger("AuthJWT");

export const JWT_COOKIE_NAME = "jarvis_session";
export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24; // 1 day
export const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const getSecretKey = () => {
  const secret = serverEnv.authSecret;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Check environment variables.");
  }
  return new TextEncoder().encode(secret);
};

export interface SessionPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export async function signSession(
  payload: SessionPayload,
  expiresInSeconds: number
): Promise<string> {
  try {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresInSeconds;

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(getSecretKey());
  } catch (error) {
    log.error("Failed to sign JWT", { error });
    throw error;
  }
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    // Expected on token expiry
    return null;
  }
}
