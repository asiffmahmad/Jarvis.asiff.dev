import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accounts = await prisma.platformAccount.findMany({
      orderBy: { createdAt: "desc" },
    });

    const parsedAccounts = accounts.map(a => ({
      id: a.id,
      platformId: a.platformId,
      accountName: a.accountName,
      handle: a.handle,
      avatarUrl: a.avatarUrl,
      status: a.status,
    }));

    if (parsedAccounts.length === 0) {
      // Inject dummy accounts so the user can test the scheduling feature
      parsedAccounts.push(
        { id: "acc_li_1", platformId: "linkedin", accountName: "Tony Stark", handle: "@ironman", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tony", status: "active" },
        { id: "acc_ig_1", platformId: "instagram", accountName: "Stark Industries", handle: "@starkindustries", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=stark", status: "active" },
        { id: "acc_x_1", platformId: "x", accountName: "Tony Stark", handle: "@tonystark", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tonyx", status: "active" }
      );
    }

    return NextResponse.json({
      accounts: parsedAccounts,
    });
  } catch (error) {
    console.error("[ACCOUNTS GET API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
