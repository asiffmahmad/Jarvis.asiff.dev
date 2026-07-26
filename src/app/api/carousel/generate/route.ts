import { NextResponse } from "next/server";
import { generateText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";
import { createLogger } from "@/lib/logger";

const log = createLogger("CarouselAPI");

export async function POST(req: Request) {
  try {
    const { action, topic, platform, text } = await req.json();

    const aiModel = AIProviderFactory.getModel("balanced");

    let prompt = "";

    switch (action) {
      case "generate_slide":
        prompt = `You are a social media expert. Create the content for a single, high-impact slide for a carousel about "${topic}" optimized for ${platform}. Output only the text for the slide (a catchy title and a short 1-2 sentence paragraph). Do not include any meta-text.`;
        break;
      case "improve":
        prompt = `Improve the following text for a social media carousel slide to make it more engaging and punchy:\n\n${text}`;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await AIProviderFactory.generateText({
      task: "balanced",
      system: "[JARVIS INTELLIGENCE PROTOCOL: MASTER COPYWRITER] You are an elite social media copywriter specializing in high-retention carousel slides. Always output short, punchy, high-value text without any pleasantries or generic AI vocabulary.",
      prompt: prompt,
      temperature: 0.7,
    });

    const generatedText = result.text;

    return NextResponse.json({ content: generatedText.trim() });
  } catch (error) {
    log.error("Carousel generation failed", { error });
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
