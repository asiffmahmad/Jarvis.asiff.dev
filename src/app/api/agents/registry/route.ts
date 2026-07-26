import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany();
    return NextResponse.json(agents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const agent = await prisma.agent.create({
      data: {
        name: body.name,
        description: body.description,
        systemPrompt: body.systemPrompt || "You are a helpful AI.",
        model: body.model || "gpt-4",
        apiProvider: body.apiProvider || "groq",
        usageLeft: body.usageLeft !== undefined ? body.usageLeft : 1000,
        isActive: true,
      }
    });
    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(agent);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}
