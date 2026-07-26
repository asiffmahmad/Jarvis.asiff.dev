import { NextResponse } from "next/server";
import { AIProviderFactory } from "@/lib/ai/factory";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { categoryTotals } = await req.json();

    if (!categoryTotals || !Array.isArray(categoryTotals) || categoryTotals.length === 0) {
      return NextResponse.json({ roast: "No transactions to criticize yet. Go spend some money first so I have something to roast you for!" });
    }

    const totalSpent = categoryTotals.reduce((sum, c) => sum + c.total, 0);
    const totalsString = categoryTotals
      .map(c => `- ${c.name}: ₹${c.total.toFixed(2)} (${((c.total / totalSpent) * 100).toFixed(0)}%)`)
      .join("\n");

    const prompt = `You are a brutally honest, sarcastic, and extremely harsh financial advisor agent.
Review the user's spending totals for this month:
${totalsString}
Total Outflow: ₹${totalSpent.toFixed(2)}

Instructions:
1. Write a harsh, bold, direct warning/caution message (maximum 2-3 sentences) roasting the user about where they are wasting money.
2. Call out their top spending category specifically and mock their lack of discipline.
3. Be blunt, punchy, and sarcastic. Do not use generic filler advice. Speak to them directly (use "You").
4. Return ONLY the roast text. Do not wrap in markdown quotes or add extra commentary.`;

    const aiRes = await AIProviderFactory.generateText({
      task: "balanced",
      prompt,
    });

    return NextResponse.json({ roast: aiRes.text.trim() });
  } catch (error: any) {
    console.error("[EXPENSES ROAST] Error:", error);
    return NextResponse.json({ error: "Failed to generate caution advice" }, { status: 500 });
  }
}
