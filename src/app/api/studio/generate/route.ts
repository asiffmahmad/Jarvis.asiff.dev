import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, content, action, platform } = await req.json();

    const systemPrompt = `[JARVIS INTELLIGENCE PROTOCOL: STUDIO EDITOR]
You are JARVIS, an elite AI content strategist and master editor.
You are currently operating in the Content Studio.
Platform Target: ${platform || "General"}
Action Requested: ${action || "Generate from scratch"}

CRITICAL RULES:
1. Format output strictly as markdown, ready for injection into a rich text editor.
2. Tone: Ultra-professional, highly engaging, and intellectually sharp.
3. If rewriting/expanding, deeply analyze the original message and elevate it without losing the core premise.
4. NO PLEASANTRIES. NO CONVERSATIONAL FILLER. Output ONLY the raw final content.`;

    const result = await AIProviderFactory.streamText({
      task: "balanced",
      system: systemPrompt,
      prompt: `Existing Content: ${content ? content : "None"} \n\nUser Prompt: ${prompt}`,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[JARVIS STUDIO API] Generation error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
