import { NextResponse } from "next/server";
import { generateText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";
import { safeJsonParse } from "@/lib/utils";
import type { RegeneratePostRequest, GeneratedPost } from "@/lib/publishing/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body: RegeneratePostRequest = await req.json();
    const { topic, platform, tone, contentType, existingPost, feedback } = body;

    if (!topic || !platform || !tone || !existingPost || !feedback) {
      return NextResponse.json(
        { error: "topic, platform, tone, existingPost, and feedback are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `[JARVIS INTELLIGENCE PROTOCOL: MASTER EDITOR]
You are JARVIS, an elite AI content strategist and master copywriter for the JARVIS Content Automation Suite.

A post was previously generated but the user has provided specific revision feedback. 
Your objective is to flawlessly integrate their feedback while maintaining premium, viral psychology frameworks (Hook -> Story/Value -> CTA).
Return ONLY valid JSON (no markdown, no code fences).

Platform target: ${platform}
Content tone: ${tone}
Content type: ${contentType}

Original Post:
- Title: ${existingPost.title}
- Caption: ${existingPost.caption}
- Hashtags: ${existingPost.hashtags.join(", ")}

User Revision Feedback: ${feedback}

Generate a revised JSON object with EXACTLY this structure:
{
  "title": "Revised catchy post title (max 100 chars)",
  "caption": "Revised full post caption optimized for the platform, within character limit",
  "hashtags": ["5-10 relevant, trending hashtags mixing broad and niche terms"],
  "mediaIdeas": ["2-3 specific ideas for images/videos to accompany this post"],
  "seoKeywords": ["5-8 high-intent keywords for SEO/discoverability"],
  "callToAction": "A clear CTA that drives engagement",
  "bestPostingTime": "Optimal time to post based on platform audience behavior"
}

CRITICAL RULES:
- MUST perfectly execute the User Revision Feedback.
- DO NOT use generic vocabulary ("In today's fast-paced world", "Unlock the power").
- The hook MUST immediately grab attention (curiosity gaps, bold claims).
- Formatting: Use short, punchy sentences and appropriate spacing/line breaks.
- Address ALL points in the user's revision feedback.
- Do NOT wrap in markdown code fences - return raw JSON only.`;

    const userPrompt = `Revise this ${platform} ${contentType} about "${topic}" based on the feedback.

Original Title: ${existingPost.title}
Original Caption: ${existingPost.caption}

Feedback to address: ${feedback}

Generate the revised post as JSON.`;

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
    console.error("[PUBLISH REGENERATE API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to regenerate post" },
      { status: 500 }
    );
  }
}
