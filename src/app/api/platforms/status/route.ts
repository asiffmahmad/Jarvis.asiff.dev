import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = {
    x: !!process.env.X_API_KEY && !!process.env.X_API_SECRET && !!process.env.X_ACCESS_TOKEN && !!process.env.X_ACCESS_TOKEN_SECRET && !!process.env.X_BEARER_TOKEN,
    linkedin: !!process.env.LINKEDIN_ACCESS_TOKEN,
    instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
    facebook: false,
    threads: !!process.env.THREADS_ACCESS_TOKEN,
    youtube: !!process.env.YOUTUBE_API_KEY,
    tiktok: false,
    pinterest: false,
  };

  return NextResponse.json(status);
}
