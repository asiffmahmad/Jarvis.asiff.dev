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
      handle: "@" + a.accountName.toLowerCase().replace(/\s+/g, ""),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(a.accountName)}`,
      status: "active",
    }));

    const hasLinkedInDB = parsedAccounts.some(a => a.platformId === "linkedin");
    if (!hasLinkedInDB) {
      const hasLinkedIn = !!process.env.LINKEDIN_ACCESS_TOKEN;
      if (hasLinkedIn) {
        parsedAccounts.push({
          id: "acc_li_real",
          platformId: "linkedin",
          accountName: "My LinkedIn Account",
          handle: "@mylinkedin",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=realli",
          status: "active"
        });
      } else {
        parsedAccounts.push({ id: "acc_li_1", platformId: "linkedin", accountName: "Tony Stark", handle: "@ironman", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tony", status: "active" });
      }
    }

    const hasInstagramDB = parsedAccounts.some(a => a.platformId === "instagram");
    if (!hasInstagramDB) {
      parsedAccounts.push(
        { id: "acc_ig_1", platformId: "instagram", accountName: "Stark Industries", handle: "@starkindustries", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=stark", status: "active" }
      );
    }
    
    const hasXDB = parsedAccounts.some(a => a.platformId === "x");
    if (!hasXDB) {
      const hasXKeys = !!process.env.X_API_KEY && !!process.env.X_ACCESS_TOKEN;
      if (hasXKeys) {
        parsedAccounts.push({
          id: "acc_x_real",
          platformId: "x",
          accountName: "My X Account",
          handle: "@myxaccount",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=realx",
          status: "active"
        });
      } else {
        parsedAccounts.push({ id: "acc_x_1", platformId: "x", accountName: "Tony Stark", handle: "@tonystark", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tonyx", status: "active" });
      }
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
