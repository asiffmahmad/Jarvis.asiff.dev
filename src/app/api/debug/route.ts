import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let registryError = null;
    let configError = null;
    let agents: any[] = [];
    let settings = null;

    try {
      agents = await prisma.agent.findMany();
    } catch(e: any) {
      registryError = e.message;
    }

    try {
      settings = await prisma.settings.findFirst();
    } catch(e: any) {
      configError = e.message;
    }

    return NextResponse.json({ agents, settings, registryError, configError });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
