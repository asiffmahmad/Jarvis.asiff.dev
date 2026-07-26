import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    let agents: any[] = await prisma.$queryRaw`SELECT * FROM Agent`;
    
    // Auto-seed JARVIS if it doesn't exist
    if (!agents.find(a => a.name === "JARVIS")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'JARVIS',
          'Core AI operating system and pipeline approver.',
          'You are JARVIS, an advanced AI system. Your directive is to evaluate, approve, and execute the final output of the automation pipeline.',
          'gpt-4',
          'system',
          9999,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }
    
    // Auto-seed Automation Planner if it doesn't exist
    if (!agents.find(a => a.name === "Automation Planner")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Automation Planner',
          'Plans tasks and structures automated posts',
          'You are the overarching Automation Planner Agent. You control the full applications automation strategy.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }
    
    return NextResponse.json(agents);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch agents: " + (error.message || String(error)) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = Math.random().toString(36).substring(7);
    await prisma.$executeRaw`
      INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, apiKey, usageLeft, isActive, updatedAt)
      VALUES (
        ${id},
        ${body.name},
        ${body.description || null},
        ${body.systemPrompt || 'You are a helpful AI.'},
        ${body.model || 'gpt-4'},
        ${body.apiProvider || 'groq'},
        ${body.apiKey || null},
        ${body.usageLeft !== undefined ? body.usageLeft : 1000},
        1,
        NOW()
      )
    `;
    const agents: any[] = await prisma.$queryRaw`SELECT * FROM Agent WHERE id = ${id}`;
    return NextResponse.json(agents[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, systemPrompt, model, apiProvider, apiKey, usageLeft, isActive } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE Agent
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        systemPrompt = COALESCE(${systemPrompt}, systemPrompt),
        model = COALESCE(${model}, model),
        apiProvider = COALESCE(${apiProvider}, apiProvider),
        apiKey = COALESCE(${apiKey}, apiKey),
        usageLeft = COALESCE(${usageLeft}, usageLeft),
        isActive = COALESCE(${isActive ? 1 : 0}, isActive),
        updatedAt = NOW()
      WHERE id = ${id}
    `;

    const agents: any[] = await prisma.$queryRaw`SELECT * FROM Agent WHERE id = ${id}`;
    return NextResponse.json(agents[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}
