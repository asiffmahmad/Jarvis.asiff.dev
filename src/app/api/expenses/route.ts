import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("[EXPENSES API] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, merchant, category, date, currency, rawEmailSubject, rawEmailBody } = body;

    if (!amount || !merchant || !category || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        merchant,
        category,
        date: new Date(date),
        currency: currency || "USD",
        rawEmailSubject: rawEmailSubject || null,
        rawEmailBody: rawEmailBody || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error("[EXPENSES API] POST Error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[EXPENSES API] DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
