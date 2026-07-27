import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ttsUrl = process.env.TTS_AGENT_URL || "http://localhost:4000";

    const ttsRes = await fetch(`${ttsUrl}/api/v1/tts/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await ttsRes.json();

    if (!ttsRes.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "TTS generation failed" },
        { status: ttsRes.status }
      );
    }

    // Rewrite relative audioUrl to proxied Next.js URL (browser-accessible)
    if (data.audioUrl) {
      const id = data.audioUrl.replace("/audio/", "").replace(".m4a", "");
      data.audioUrl = `/api/media/audio/${id}.m4a`;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("TTS Proxy error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "TTS proxy failed" },
      { status: 500 }
    );
  }
}
