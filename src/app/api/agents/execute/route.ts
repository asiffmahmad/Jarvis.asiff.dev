import { NextResponse } from "next/server";
import { generateText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { agentId, runtimeVariables, linkedPromptContent } = await req.json();

    let finalSystemPrompt = `You are an AI Agent with ID: ${agentId}.`;
    
    if (linkedPromptContent) {
      finalSystemPrompt = linkedPromptContent;
      if (runtimeVariables) {
        for (const [key, value] of Object.entries(runtimeVariables)) {
          const regex = new RegExp(`{{${key}}}`, "g");
          finalSystemPrompt = finalSystemPrompt.replace(regex, String(value));
        }
      }
    }

    const aiModel = AIProviderFactory.getModel("balanced");

    const systemPromptWrapper = `[JARVIS AGENT FRAMEWORK]
You are a highly capable AI agent operating within the JARVIS framework.
${finalSystemPrompt}
Execute your assigned task autonomously based on the provided context.`;

    const userMessage = runtimeVariables?.user_prompt || "Execute your primary objective based on the provided variables.";

    const result = await generateText({
      model: aiModel,
      messages: [
        { role: "system", content: systemPromptWrapper },
        { role: "user", content: userMessage }
      ],
    });

    return NextResponse.json({ text: result.text });
  } catch (error: unknown) {
    console.error("[JARVIS AGENT API] Execution error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
