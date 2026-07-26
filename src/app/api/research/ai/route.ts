import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { action, articleTitle, articleContent } = await req.json();

    const providerStr = "groq"; 
    const provider = AIProviderFactory.getProvider(providerStr);
    const aiModel = provider.getModel();

    let systemPrompt = "";

    switch (action) {
      case "summarize":
        systemPrompt = `[JARVIS INTELLIGENCE PROTOCOL: RESEARCH SUMMARIZATION]
You are JARVIS, an elite AI Research Analyst.
Your objective is to dissect and analyze the provided article with zero fluff.
Output a structured Markdown summary containing:
- 3 Bullet Points (Executive TL;DR)
- Core Strategic Takeaways
- Technical Highlights (if applicable)
- Action Items (if applicable)
Be hyper-concise, strictly accurate, and professional.`;
        break;
      default:
        systemPrompt = "You are JARVIS, an elite AI Research Assistant.";
    }

    const result = await AIProviderFactory.streamText({
      task: "balanced",
      system: systemPrompt,
      prompt: `Title: ${articleTitle}\n\nContent:\n${articleContent}`,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[JARVIS RESEARCH AI] Execution error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
