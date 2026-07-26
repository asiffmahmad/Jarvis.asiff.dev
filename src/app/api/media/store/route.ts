import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "No url provided" }, { status: 400 });
    }

    // Download the media
    const mediaResponse = await fetch(url);
    if (!mediaResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch media: ${mediaResponse.statusText}` },
        { status: 500 }
      );
    }

    const contentType = mediaResponse.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await mediaResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract filename if possible
    let filename = url.split("/").pop();
    if (filename && filename.includes("?")) {
      filename = filename.split("?")[0];
    }

    // Save as BLOB
    const savedBlob = await prisma.mediaBlob.create({
      data: {
        filename: filename || "downloaded-media",
        mimeType: contentType,
        data: buffer,
        sourceUrl: url,
      },
    });

    return NextResponse.json({ 
      success: true, 
      id: savedBlob.id,
      filename: savedBlob.filename,
      mimeType: savedBlob.mimeType,
      size: buffer.length
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error storing media blob:", error);
    return NextResponse.json({ error: "Failed to store media blob: " + (error.message || String(error)) }, { status: 500 });
  }
}
