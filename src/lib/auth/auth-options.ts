import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        if (account.provider === "google" && user) {
          try {
            const prisma = (await import("@/lib/db/prisma")).default;
            
            // Find or create user matching Google email
            let dbUser = await prisma.user.findUnique({
              where: { email: user.email || "" }
            });
            if (!dbUser) {
              dbUser = await prisma.user.create({
                data: {
                  email: user.email || "google@user.local",
                  name: user.name || "Google User",
                  password: "google_oauth_user",
                }
              });
            }

            // Sync token to PlatformAccount table
            await prisma.platformAccount.upsert({
              where: {
                userId_platformId_accountName: {
                  userId: dbUser.id,
                  platformId: "gmail",
                  accountName: user.email || "Google Account",
                }
              },
              update: {
                accessToken: account.access_token || "",
                refreshToken: account.refresh_token || undefined,
                expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
              },
              create: {
                userId: dbUser.id,
                platformId: "gmail",
                accountName: user.email || "Google Account",
                accessToken: account.access_token || "",
                refreshToken: account.refresh_token || "",
                expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
              }
            });
          } catch (dbErr) {
            console.error("Failed to sync Google PlatformAccount:", dbErr);
          }
        }
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      return session;
    }
  }
};
