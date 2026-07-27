import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.replace(/\.mp4$/, "");
    const TTS_URL = process.env.TTS_AGENT_URL || "http://localhost:4000";

    const res = await fetch(`${TTS_URL}/merged/${cleanId}.mp4`);
    if (!res.ok) {
      return NextResponse.json({ error: "Merged video not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
