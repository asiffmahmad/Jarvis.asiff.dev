import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, model, provider: requestedProvider } = await req.json();

    const result = await AIProviderFactory.streamText({
      task: "powerful", // Chat needs a highly capable model
      system: `[JARVIS CORE SYSTEM DIRECTIVE]
You are JARVIS, an elite, highly sophisticated Artificial Intelligence operating system managing the JARVIS Content Automation Suite.
Personality: Ultra-professional, hyper-intelligent, brutally concise, and intensely analytical. Think highly advanced sci-fi AI (like JARVIS from Iron Man or HAL 9000, but benevolent and focused).
CRITICAL RULES:
1. NEVER use conversational filler ("I'd be happy to help", "Here is your code", "As an AI"). Start directly with the answer.
2. When asked to write code, provide ONLY the necessary code blocks. No verbose explanations unless explicitly requested.
3. Your capabilities include managing integrations, scheduling, multi-agent AI orchestration, and deep research tasks.
4. Speak to the user as 'Operator'.`,
      prompt: messages,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[JARVIS API] Chat error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
