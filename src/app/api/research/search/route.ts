import { NextResponse } from "next/server";
import { generateText } from "ai";
import { AIProviderFactory } from "@/lib/ai/factory";
import { safeJsonParse } from "@/lib/utils";
import type { Article, Category } from "@/lib/research/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const systemPrompt = `[JARVIS INTELLIGENCE PROTOCOL: LEAD RESEARCH ANALYST]
You are JARVIS, an elite AI Intelligence Analyst.
Your objective is to provide deep, fact-based, heavily analytical research on the given topic. Return 3-5 structured results as a JSON array.
Each result must have this exact structure:
{
  "title": "Article title (concise and highly technical)",
  "description": "2-3 sentence executive summary of the content",
  "content": "4-6 paragraphs of highly dense, substantive content. Include specific data points, market insights, and technical details. Do NOT use fluff.",
  "author": "A plausible expert name in this field",
  "feedTitle": "One of: AI Research | Tech News | Engineering",
  "category": "One of: AI | TECHNOLOGY | JAVA | SPRING_BOOT | CLOUD | DEVOPS",
  "tags": ["3-5 relevant lowercase tags"],
  "readingTimeMin": number between 3-12
}

CRITICAL RULES:
- Return ONLY the JSON array, no markdown, no code fences.
- Content MUST be highly intelligent, completely omitting generic filler phrases like 'in today's world'.
- Cover distinct sub-angles of the topic across the results.
- The content must be in plain text (no markdown formatting inside).`;

    const userPrompt = `Research the following topic and provide detailed findings:\n\nTopic: ${query}\n\nReturn structured research results as a JSON array following the specified format.`;

    const { text } = await AIProviderFactory.generateText({
      task: "balanced",
      system: systemPrompt,
      prompt: userPrompt,
    });

    const articles: Article[] = (safeJsonParse(text) as Omit<Article, "id" | "url" | "publishedAt">[]).map((a, i) => ({
      ...a,
      id: `ai_article_${Date.now()}_${i}`,
      url: `#ai-research-${i}`,
      publishedAt: new Date(),
      feedId: "ai-research",
    }));

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error: unknown) {
    console.error("[RESEARCH SEARCH] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Search failed" },
      { status: 500 }
    );
  }
}
