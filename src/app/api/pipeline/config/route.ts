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
    
    // Migrate default pipeline if needed
    let pipelines = preferences.pipelines || [];
    if (!pipelines || pipelines.length === 0) {
      pipelines = [
        {
          id: "default",
          name: "Default Pipeline",
          flow: preferences.pipelineFlow || []
        }
      ];
    }

    // Dynamic ID lookup to prevent mismatched IDs across environments
    let agents: any[] = await prisma.$queryRaw`SELECT id, name FROM Agent`;
    const promptAgent = agents.find((a: any) => a.name === "Prompt Agent");
    const copywriterAgent = agents.find((a: any) => a.name === "Copywriter");
    const factAuditorAgent = agents.find((a: any) => a.name === "Fact Auditor");
    const coordinatorAgent = agents.find((a: any) => a.name === "Media Coordinator");
    const mediaAgent = agents.find((a: any) => a.name === "Media Developer");
    const voiceAgent = agents.find((a: any) => a.name === "Voice Agent");
    const mergeAgent = agents.find((a: any) => a.name === "Merge Agent");

    let hasUpdates = false;

    // 1. Ensure Default Pipeline has agents if it is empty
    const defaultPipeline = pipelines.find((p: any) => p.id === "default");
    if (defaultPipeline && (!defaultPipeline.flow || defaultPipeline.flow.length === 0)) {
      const flowIds = [];
      const plannerAgent = agents.find((a: any) => a.name === "Automation Planner");
      if (plannerAgent) flowIds.push(plannerAgent.id);
      if (mediaAgent) flowIds.push(mediaAgent.id);
      defaultPipeline.flow = flowIds;
      hasUpdates = true;
    }

    // 2. Ensure Audio & Video Pipeline exists and has the correct production agents
    const expectedAgentIds = [
      promptAgent?.id,
      copywriterAgent?.id,
      factAuditorAgent?.id,
      coordinatorAgent?.id,
      mediaAgent?.id,
      voiceAgent?.id,
      mergeAgent?.id,
    ].filter(Boolean);

    let audioVideoPipeline = pipelines.find((p: any) => p.name === "Audio & Video Pipeline");
    if (!audioVideoPipeline) {
      audioVideoPipeline = {
        id: "audio_video_pipeline",
        name: "Audio & Video Pipeline",
        flow: expectedAgentIds
      };
      pipelines.push(audioVideoPipeline);
      hasUpdates = true;
    } else {
      // Update existing pipeline if agents are missing or out of order
      const currentFlow = audioVideoPipeline.flow || [];
      const expectedSet = new Set(expectedAgentIds);
      const currentSet = new Set(currentFlow);
      const missing = expectedAgentIds.filter((id: string) => !currentSet.has(id));
      const extra = currentFlow.filter((id: string) => !expectedSet.has(id));
      if (missing.length > 0 || extra.length > 0 || currentFlow.length !== expectedAgentIds.length) {
        audioVideoPipeline.flow = expectedAgentIds;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      preferences.pipelines = pipelines;
      // Sync default flow to legacy pipelineFlow field
      const def = pipelines.find((p: any) => p.id === "default");
      if (def) {
        preferences.pipelineFlow = def.flow;
      }
      
      await prisma.settings.update({
        where: { id: settings.id },
        data: { preferences }
      });
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
