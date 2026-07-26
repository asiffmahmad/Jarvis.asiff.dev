import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const TTS_URL = process.env.TTS_AGENT_URL || "http://localhost:4000";

    const res = await fetch(`${TTS_URL}/api/v1/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.error }, { status: res.status });
    }

    // Rewrite the internal tts-agent URL to a proxied Next.js URL
    if (data.videoUrl) {
      data.videoUrl = `${TTS_URL}${data.videoUrl}`;
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
