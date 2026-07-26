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
        preferences: { pipelineFlow: [], pipelines: [] }
      }
    });
  }
  return settings;
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();
    const preferences = (settings.preferences as any) || {};
    
    // Migration for backward compatibility
    let pipelines = preferences.pipelines;
    if (!pipelines || pipelines.length === 0) {
      pipelines = [
        {
          id: "default",
          name: "Default Pipeline",
          flow: preferences.pipelineFlow || []
        }
      ];
    }

    return NextResponse.json({ 
      pipelineFlow: preferences.pipelineFlow || [],
      pipelines 
    });
  } catch (error) {
    console.error("Failed to fetch pipeline config:", error);
    return NextResponse.json({ error: "Failed to fetch pipeline config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = await getOrCreateSettings();
    
    const preferences = (settings.preferences as any) || {};
    
    if (body.pipelines) {
      preferences.pipelines = body.pipelines;
      // sync the default back to pipelineFlow just in case
      const defaultPipeline = body.pipelines.find((p: any) => p.id === "default");
      if (defaultPipeline) {
        preferences.pipelineFlow = defaultPipeline.flow;
      }
    } else if (body.pipelineFlow) {
      preferences.pipelineFlow = body.pipelineFlow;
    }

    await prisma.settings.update({
      where: { id: settings.id },
      data: { preferences }
    });

    return NextResponse.json({ success: true, pipelines: preferences.pipelines, pipelineFlow: preferences.pipelineFlow });
  } catch (error) {
    console.error("Failed to update pipeline config:", error);
    return NextResponse.json({ error: "Failed to update pipeline config" }, { status: 500 });
  }
}
