import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const folders = await prisma.assetFolder.findMany();
    return NextResponse.json(folders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}
