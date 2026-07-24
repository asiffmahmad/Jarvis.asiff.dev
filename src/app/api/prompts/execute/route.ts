import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { promptContent, variables } = await req.json();

    // The user might pass variables (e.g. { topic: "AI", audience: "Developers" })
    let finalPrompt = promptContent || "";
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        // Replace all instances of {{key}} with the value
        const regex = new RegExp(`{{${key}}}`, "g");
        finalPrompt = finalPrompt.replace(regex, String(value));
      }
    }

    // Default to Groq if not specified
    const providerStr = "groq"; 
    const provider = AIProviderFactory.getProvider(providerStr);
    // You could pass modelName to getModel() if the factory supported it.
    const aiModel = provider.getModel();

    const systemPrompt = `You are JARVIS, an expert AI operating system. 
You are currently executing a saved prompt from the Prompt Library.
Follow the user's instructions exactly.
Do not include pleasantries. Respond only with the requested output.`;

    const result = await streamText({
      model: aiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: finalPrompt }
      ],
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[JARVIS PROMPTS API] Execution error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
