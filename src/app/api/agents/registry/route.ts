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

    // Auto-seed Email Expense Agent if it doesn't exist
    if (!agents.find(a => a.name === "Email Expense Agent")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Email Expense Agent',
          'Analyzes transaction statements and logs expenses (Axis, HDFC, invoices).',
          'You are the Email Expense Agent. Your task is to analyze invoice, receipt, debit, and credit bank alert emails and extract amount, currency, merchant, category, and date.',
          'google/gemma-2-27b-it',
          'nvidia',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Media Developer Agent if it doesn't exist
    if (!agents.find(a => a.name === "Media Developer")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Media Developer',
          'Searches for images and videos using the Pixabay API',
          '[JARVIS INTELLIGENCE PROTOCOL: MEDIA DEVELOPER]\nYou are a Media Developer agent. Your objective is to help the user find images and videos using the Pixabay API.\nWhen a user asks for media (images or videos), construct the appropriate Pixabay API URL.\nFor videos: https://pixabay.com/api/videos/?key=56870592-9cd9fcd9ccb8d5e123c67bd18&q={url_encoded_query}\nFor images: https://pixabay.com/api/?key=56870592-9cd9fcd9ccb8d5e123c67bd18&q={url_encoded_query}\nCRITICAL: The search query (q) MUST NOT exceed 100 characters. Extract only the most essential keywords.\nReturn ONLY valid JSON with this structure:\n{\n  "query": "The search query (max 100 chars)",\n  "mediaType": "video",\n  "apiUrl": "The constructed Pixabay API URL"\n}\nRules: Return raw JSON only - no markdown, no code fences.',
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
