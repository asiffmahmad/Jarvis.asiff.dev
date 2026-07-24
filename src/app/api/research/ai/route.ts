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
        systemPrompt = `You are an AI Research Analyst.
Analyze the provided article.
Output a structured Markdown summary containing:
- 3 Bullet Points (TL;DR)
- Key Takeaways
- Technical Highlights (if applicable)
- Action Items (if applicable)
Be concise and highly accurate.`;
        break;
      default:
        systemPrompt = "You are a helpful AI Research Assistant.";
    }

    const result = await streamText({
      model: aiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Title: ${articleTitle}\n\nContent:\n${articleContent}` }
      ],
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
