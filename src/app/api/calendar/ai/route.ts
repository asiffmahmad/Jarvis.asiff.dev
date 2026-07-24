import { streamText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { action, calendarData } = await req.json();

    const providerStr = "groq"; 
    const provider = AIProviderFactory.getProvider(providerStr);
    const aiModel = provider.getModel();

    let systemPrompt = "";

    switch (action) {
      case "daily_summary":
        systemPrompt = `You are an AI Executive Assistant managing a busy professional's calendar.
Review the provided events and tasks for the day. 
Generate a concise briefing. Highlight any potential scheduling conflicts (overlapping events). Suggest which tasks should be prioritized.
Respond in clear, structured Markdown. Keep it brief.`;
        break;
      default:
        systemPrompt = "You are a helpful AI Calendar Assistant.";
    }

    const result = await streamText({
      model: aiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Today's Schedule:\n${JSON.stringify(calendarData, null, 2)}` }
      ],
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[JARVIS CALENDAR AI] Execution error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
