import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blob = await prisma.mediaBlob.findUnique({ where: { id } });
    if (!blob) {
      return NextResponse.json({ error: "Blob not found" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(blob.data), {
      headers: {
        "Content-Type": blob.mimeType,
        "Content-Disposition": `inline; filename="${blob.filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
