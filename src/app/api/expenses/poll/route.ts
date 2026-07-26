import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import prisma from "@/lib/db/prisma";
import { POST as analyzePOST } from "../analyze/route";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Google or missing Access Token. Please log in using Google." },
        { status: 401 }
      );
    }

    let dateQuery = "";
    try {
      const body = await req.json().catch(() => ({}));
      const { month, year } = body;
      if (month && year) {
        const m = parseInt(month);
        const y = parseInt(year);
        const afterDate = `${y}/${String(m).padStart(2, '0')}/01`;
        const nextMonth = m === 12 ? 1 : m + 1;
        const nextMonthYear = m === 12 ? y + 1 : y;
        const beforeDate = `${nextMonthYear}/${String(nextMonth).padStart(2, '0')}/01`;
        dateQuery = ` after:${afterDate} before:${beforeDate}`;
      }
    } catch {}

    // 1. Fetch recent emails matching search query for invoices/receipts
    const query = `subject:(receipt OR invoice OR bill OR billing OR payment OR order OR subscription OR charge OR axis OR hdfc OR debit OR credit OR credited OR transaction)${dateQuery}`;
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listRes.ok) {
      const errText = await listRes.text();
      return NextResponse.json(
        { error: `Failed to query Gmail: ${errText}` },
        { status: listRes.status }
      );
    }

    const listData = await listRes.json();
    const messages = listData.messages || [];

    if (messages.length === 0) {
      return NextResponse.json({ processed: 0, message: "No matching receipt/invoice emails found." });
    }

    let processedCount = 0;
    let newExpensesCount = 0;

    // 2. Fetch message details and run the analyzer on each
    for (const msgRef of messages) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!msgRes.ok) continue;
      const message = await msgRes.json();

      // Extract subject
      const headers = message.payload?.headers || [];
      const subjectHeader = headers.find((h: any) => h.name?.toLowerCase() === "subject");
      const subject = subjectHeader ? subjectHeader.value : "No Subject";

      // Check if we've already processed this email to prevent duplicates
      const existing = await prisma.expense.findFirst({
        where: { rawEmailSubject: subject },
      });

      if (existing) continue;

      // Extract email body text
      let bodyText = message.snippet || "";
      
      // Basic body parsing from MIME parts if available
      const parts = message.payload?.parts;
      if (parts && parts.length > 0) {
        const textPart = parts.find((p: any) => p.mimeType === "text/plain");
        if (textPart && textPart.body?.data) {
          bodyText = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      } else if (message.payload?.body?.data) {
        bodyText = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
      }

      processedCount++;

      // Trigger the analyzer endpoint locally
      const mockReq = new Request("http://127.0.0.1/api/expenses/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body: bodyText }),
      });
      const analyzeRes = await analyzePOST(mockReq);

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        if (analyzeData.isExpense) {
          newExpensesCount++;
        }
      }
    }

    return NextResponse.json({
      processed: processedCount,
      newExpenses: newExpensesCount,
      message: `Checked ${messages.length} emails. Processed ${processedCount} new messages, imported ${newExpensesCount} expenses.`,
    });
  } catch (error: any) {
    console.error("[EXPENSES POLL] Error:", error);
    return NextResponse.json({ error: `Failed to poll Gmail inbox: ${error.message || String(error)}` }, { status: 500 });
  }
}
