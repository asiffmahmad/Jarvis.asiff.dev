import { NextResponse } from "next/server";
import { AIProviderFactory } from "@/lib/ai/factory";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { subject, body } = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Email body is required" }, { status: 400 });
    }

    const prompt = `Analyze the following email content and extract any transaction, purchase, receipt, invoice, expense, or credit details.

Subject: ${subject || "No Subject"}
Body:
${body}

Instructions:
1. Determine if this email represents a financial transaction (e.g. receipts, invoices, subscription charges, order confirmations, debit alerts, credit alerts, refunds, bank transfers, deposits).
2. If it is NOT a financial transaction, return ONLY this JSON: { "isExpense": false }
3. If it IS a financial transaction, extract:
   - amount: The numerical value of the transaction (Float). Use POSITIVE values for debits, payments, purchases, and expenses (money outflow). Use NEGATIVE values for credits, refunds, deposits, and income (money inflow).
   - currency: The 3-letter currency code (e.g. USD, EUR, INR, GBP). Default is INR.
   - merchant: The name of the merchant/company/service or bank (e.g. Uber, Amazon, Netflix, Axis Bank, HDFC Bank, Refund).
   - category: Categorize the transaction. Choose one from: "Software/Hosting", "Travel/Transport", "Meals/Entertainment", "Office Supplies", "Marketing/Ads", "Utilities/Rent", "Services/Fees", "Income/Credits", or "Miscellaneous".
   - date: The date of the transaction in ISO 8601 format. If no date is found, use the current date.
4. Return ONLY a valid JSON object matching the instructions above. Do not include markdown code block formatting or additional commentary.`;

    const aiRes = await AIProviderFactory.generateText({
      task: "balanced",
      prompt,
    });

    let cleanedText = aiRes.text.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("[EXPENSES ANALYZE] AI JSON parse error:", cleanedText);
      return NextResponse.json({ error: "AI response was not valid JSON" }, { status: 500 });
    }

    if (!parsedData.isExpense) {
      return NextResponse.json({ isExpense: false, message: "Email does not contain an expense." });
    }

    const { amount, currency, merchant, category, date } = parsedData;

    if (!amount || !merchant) {
      return NextResponse.json({ isExpense: false, message: "Failed to extract core expense details (amount or merchant)." });
    }

    // Save to DB
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        currency: currency || "INR",
        merchant,
        category: category || "Miscellaneous",
        date: date ? new Date(date) : new Date(),
        rawEmailSubject: subject || null,
        rawEmailBody: body,
      },
    });

    return NextResponse.json({
      isExpense: true,
      expense,
    });
  } catch (error: any) {
    console.error("[EXPENSES ANALYZE] Error:", error);
    return NextResponse.json({ error: "Failed to analyze email" }, { status: 500 });
  }
}
