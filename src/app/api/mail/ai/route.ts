import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { action, threadContext, instructions } = await req.json();

    const providerStr = "groq"; 
    const provider = AIProviderFactory.getProvider(providerStr);
    const aiModel = provider.getModel();

    let systemPrompt = "";

    switch (action) {
      case "summarize":
        systemPrompt = `You are a highly efficient executive assistant. Your task is to summarize the following email thread. 
Please provide a brief, professional summary. Do not include pleasantries. Focus on the core discussion points, action items, and deadlines.
Respond in clear, structured Markdown.`;
        break;
      case "smart_reply":
        systemPrompt = `You are an AI Email Assistant writing on behalf of the user. Draft a professional reply to the last email in the thread.
Consider the context. Follow any specific instructions provided. Do not use generic placeholders like [Your Name]. Just write the body of the email.
Instructions: ${instructions || "Keep it polite and concise."}`;
        break;
      case "improve_tone":
        systemPrompt = `Rewrite the provided email draft to sound more ${instructions || "professional"}. Keep the core message exactly the same, but improve the vocabulary and tone.`;
        break;
      default:
        systemPrompt = "You are a helpful AI assistant.";
    }

    const result = await streamText({
      model: aiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context:\n${threadContext}` }
      ],
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[JARVIS MAIL AI] Execution error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
