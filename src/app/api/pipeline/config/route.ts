import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/db/prisma";

async function getOrCreateSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "admin@jarvis.local",
          name: "Admin",
          password: "mock_password"
        }
      });
    }
    settings = await prisma.settings.create({
      data: {
        userId: user.id,
        preferences: { pipelineFlow: [] }
      }
    });
  }
  return settings;
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();
    const preferences = (settings.preferences as any) || {};
    return NextResponse.json({ pipelineFlow: preferences.pipelineFlow || [] });
  } catch (error) {
    console.error("Failed to fetch pipeline config:", error);
    return NextResponse.json({ error: "Failed to fetch pipeline config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { pipelineFlow } = await req.json();
    const settings = await getOrCreateSettings();
    
    const preferences = (settings.preferences as any) || {};
    preferences.pipelineFlow = pipelineFlow;

    await prisma.settings.update({
      where: { id: settings.id },
      data: { preferences }
    });

    return NextResponse.json({ success: true, pipelineFlow });
  } catch (error) {
    console.error("Failed to update pipeline config:", error);
    return NextResponse.json({ error: "Failed to update pipeline config" }, { status: 500 });
  }
}
