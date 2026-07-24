import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, content, action, platform } = await req.json();

    const provider = AIProviderFactory.getProvider("groq");
    const aiModel = provider.getModel();

    const systemPrompt = `You are JARVIS, an expert AI content strategist and copywriter.
You are currently operating in the Content Studio.
Platform Target: ${platform || "General"}
Action Requested: ${action || "Generate from scratch"}

Instructions:
1. Always format your output directly as markdown, ready for injection into a rich text editor.
2. Maintain a professional, highly engaging, and clear tone.
3. If rewriting or expanding existing content, preserve the original core message unless instructed otherwise.
4. DO NOT include pleasantries like "Here is your content." Only output the final generated content.`;

    const result = await streamText({
      model: aiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Existing Content: ${content ? content : "None"} \n\nUser Prompt: ${prompt}` 
        }
      ],
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
