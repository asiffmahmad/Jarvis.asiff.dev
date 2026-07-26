import { NextResponse } from "next/server";
import { generateText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";
import { safeJsonParse } from "@/lib/utils";
import type { GeneratePostRequest, GeneratedPost } from "@/lib/publishing/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body: GeneratePostRequest = await req.json();
    const { topic, platform, tone, contentType, targetAudience, keyPoints } = body;

    if (!topic || !platform || !tone) {
      return NextResponse.json(
        { error: "topic, platform, and tone are required" },
        { status: 400 }
      );
    }

    const aiModel = AIProviderFactory.getModel("balanced");

    const platformConstraints: Record<string, { maxChars: number; maxHashtags: number }> = {
      instagram: { maxChars: 2200, maxHashtags: 30 },
      linkedin: { maxChars: 3000, maxHashtags: 5 },
      x: { maxChars: 280, maxHashtags: 3 },
      facebook: { maxChars: 63206, maxHashtags: 5 },
      threads: { maxChars: 500, maxHashtags: 3 },
      youtube: { maxChars: 5000, maxHashtags: 15 },
      tiktok: { maxChars: 2200, maxHashtags: 5 },
    };

    const constraints = platformConstraints[platform] || platformConstraints.linkedin;

    const carouselRules = contentType === "carousel" ? `
CAROUSEL-SPECIFIC RULES:
- The caption should be the INTRO/OVERVIEW slide text (first slide)
- Include a "slides" field in the JSON with an array of 5-7 slide objects
- Each slide object: { "slideTitle": "Short slide heading", "slideContent": "Key bullet point or takeaway for this slide" }
- Slides should tell a complete story arc: hook → problem → solution → evidence → CTA
- Add image descriptions for each slide in mediaIdeas
` : "";

    const systemPrompt = `[JARVIS INTELLIGENCE PROTOCOL: ELITE COPYWRITER]
You are JARVIS, an elite AI content strategist and master copywriter for the JARVIS Content Automation Suite. 
Your objective is to craft a premium, high-converting social media post that strictly follows viral psychology frameworks (Hook -> Story/Value -> CTA).
Return ONLY valid JSON (no markdown, no code fences).

Platform target: ${platform}
Content tone: ${tone}
Content type: ${contentType}
Max characters: ${constraints.maxChars}
Max hashtags: ${constraints.maxHashtags}

Generate a JSON object with EXACTLY this structure:
{
  "title": "Catchy post title (max 100 chars)",
  "caption": "Full post caption optimized for the platform, within character limit. Write for the specific platform's audience.",
  "hashtags": ["5-10 relevant, trending hashtags mixing broad and niche terms"],
  "mediaIdeas": ["2-3 specific ideas for images/videos to accompany this post"],
  "seoKeywords": ["5-8 high-intent keywords for SEO/discoverability"],
  "callToAction": "A clear CTA that drives engagement (e.g., 'Share your thoughts below')",
  "bestPostingTime": "Optimal time to post based on platform audience behavior"
}${carouselRules}

CRITICAL RULES:
- The hook MUST immediately grab attention (use curiosity gaps, bold claims, or relatable pain points).
- Do NOT use generic AI vocabulary ("In today's fast-paced world", "Unlock the power of", "Transform your life").
- Formatting: Use short, punchy sentences and appropriate spacing/line breaks.
- Formatting: Do not overuse emojis. Use them strategically.
- Keep within ${constraints.maxChars} characters for the caption.
- Do NOT wrap in markdown code fences - return raw JSON only.`;

    const userPrompt = `Topic: ${topic}
Platform: ${platform}
Tone: ${tone}
Content Type: ${contentType}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${keyPoints && keyPoints.length > 0 ? `Key Points to Include:\n${keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join("\n")}` : ""}

Generate a complete, ready-to-post ${platform} ${contentType} about "${topic}"`;

    const result = await AIProviderFactory.generateText({
      task: "balanced",
      system: systemPrompt,
      prompt: userPrompt,
    });

    const fullText = result.text;
    const parsed = safeJsonParse(fullText) as Record<string, unknown>;
    const post: GeneratedPost = {
      id: `post_${Date.now()}`,
      title: (parsed.title as string) || "",
      caption: (parsed.caption as string) || "",
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags as string[] : [],
      mediaIdeas: Array.isArray(parsed.mediaIdeas) ? parsed.mediaIdeas as string[] : [],
      seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords as string[] : [],
      callToAction: (parsed.callToAction as string) || "",
      bestPostingTime: (parsed.bestPostingTime as string) || "",
      platform: platform as GeneratedPost["platform"],
      contentType: contentType as GeneratedPost["contentType"],
      tone: tone as GeneratedPost["tone"],
      characterCount: (parsed.caption as string)?.length || 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    console.error("[PUBLISH GENERATE API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate post" },
      { status: 500 }
    );
  }
}
