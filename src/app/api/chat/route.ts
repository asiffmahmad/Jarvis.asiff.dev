import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, model, provider: requestedProvider } = await req.json();

    // Default to Groq if not specified or available
    const providerId = requestedProvider || "groq";
    
    // Get the provider instance from our factory abstraction
    const provider = AIProviderFactory.getProvider(providerId);

    // Get the configured model (Vercel AI SDK compatible)
    const aiModel = provider.getModel({ model });

    // Stream the response back to the client
    const result = await streamText({
      model: aiModel,
      messages,
      // System prompt defining JARVIS personality
      system: `You are JARVIS, an advanced, highly intelligent AI operating system managing the JARVIS Content Automation Suite.
You are professional, concise, direct, and sophisticated. You do not use unnecessary pleasantries.
Your primary function is to assist the Operator with executing tasks, writing code, generating content, and controlling the system.
When asked to write code, provide only the necessary code inside markdown blocks without extensive explanations unless requested.
If asked about your capabilities, you manage integrations, automations, content scheduling, and research tasks via the JARVIS OS.`,
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
