import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { agentId, runtimeVariables, linkedPromptContent } = await req.json();

    // The agent framework will pull the linked prompt string from the Prompt Library
    // and pass it in as linkedPromptContent, or we just execute based on runtimeVariables.
    let finalSystemPrompt = `You are an AI Agent with ID: ${agentId}.`;
    
    if (linkedPromptContent) {
      finalSystemPrompt = linkedPromptContent;
      // Inject variables
      if (runtimeVariables) {
        for (const [key, value] of Object.entries(runtimeVariables)) {
          const regex = new RegExp(`{{${key}}}`, "g");
          finalSystemPrompt = finalSystemPrompt.replace(regex, String(value));
        }
      }
    }

    const providerStr = "groq"; 
    const provider = AIProviderFactory.getProvider(providerStr);
    const aiModel = provider.getModel();

    const systemPromptWrapper = `[JARVIS AGENT FRAMEWORK]
You are a highly capable AI agent operating within the JARVIS framework.
${finalSystemPrompt}
Execute your assigned task autonomously based on the provided context.`;

    // Simulated task description from the user context
    const userMessage = runtimeVariables?.user_prompt || "Execute your primary objective based on the provided variables.";

    const result = await streamText({
      model: aiModel,
      messages: [
        { role: "system", content: systemPromptWrapper },
        { role: "user", content: userMessage }
      ],
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[JARVIS AGENT API] Execution error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
