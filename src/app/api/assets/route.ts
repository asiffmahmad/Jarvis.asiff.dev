import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const assets = await prisma.asset.findMany();
    return NextResponse.json(assets);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const asset = await prisma.asset.create({
      data: {
        userId: "clt1fake00000user1234567",
        filename: body.filename,
        url: body.url,
        mimeType: body.mimeType || "application/octet-stream",
        sizeBytes: body.sizeBytes || 0,
        folderId: body.folderId || null
      }
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
