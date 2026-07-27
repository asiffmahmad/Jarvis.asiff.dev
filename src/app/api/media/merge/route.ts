import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const TTS_URL = process.env.TTS_AGENT_URL || "http://localhost:4000";

    // Rewrite Next.js-proxied audio URL back to TTS agent's internal path
    if (body.audioUrl && typeof body.audioUrl === "string") {
      const match = body.audioUrl.match(/\/api\/media\/audio\/(.+)\.m4a$/);
      if (match) {
        body.audioUrl = `/audio/${match[1]}.m4a`;
      }
    }

    const res = await fetch(`${TTS_URL}/api/v1/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.error }, { status: res.status });
    }

    // Rewrite internal path to proxied Next.js URL
    if (data.videoUrl) {
      const id = data.videoUrl.replace("/merged/", "").replace(".mp4", "");
      data.videoUrl = `/api/media/merged/${id}.mp4`;
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
