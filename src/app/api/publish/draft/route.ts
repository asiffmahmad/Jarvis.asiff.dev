import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type { PostData, PendingGeneration } from "@/lib/cross-page-store";

// Helper to get or create a default user to prevent foreign key errors
async function getOrCreateUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "clt1fake00000user1234567",
        email: "default@example.com",
        name: "Default User",
        password: "hashed_password",
        role: "user",
      },
    });
  }
  return user;
}

export async function GET() {
  try {
    const user = await getOrCreateUser();
    
    // Find the latest content of type 'post' and status 'draft' or 'pending_generation'
    const latestContent = await prisma.content.findFirst({
      where: {
        userId: user.id,
        status: { in: ["draft", "pending_generation"] },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        drafts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!latestContent || latestContent.drafts.length === 0) {
      return NextResponse.json({ draft: null, pendingGen: null });
    }

    const latestDraft = latestContent.drafts[0];
    const parsedData = JSON.parse(latestDraft.body);

    if (latestContent.status === "pending_generation") {
      return NextResponse.json({ 
        draft: null, 
        pendingGen: parsedData as PendingGeneration,
        contentId: latestContent.id 
      });
    }
    
    return NextResponse.json({ 
      draft: parsedData as PostData, 
      pendingGen: null,
      contentId: latestContent.id 
    });
  } catch (error) {
    console.error("[DRAFT GET API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const { post, pendingGen } = body;

    if (!post && !pendingGen) {
      return NextResponse.json({ error: "post or pendingGen data is required" }, { status: 400 });
    }

    const isPending = !!pendingGen;
    const title = isPending ? pendingGen.topic : (post.title || "Untitled Draft");
    const status = isPending ? "pending_generation" : "draft";
    const payload = isPending ? pendingGen : post;

    // Delete any existing draft/pending_generation contents to ensure only 1 active draft session
    await prisma.content.deleteMany({
      where: {
        userId: user.id,
        status: { in: ["draft", "pending_generation"] },
      },
    });

    // Create a clean new Content draft in MySQL
    const content = await prisma.content.create({
      data: {
        userId: user.id,
        title: title || "Untitled Draft",
        type: "post",
        status: status,
        drafts: {
          create: {
            body: JSON.stringify(payload),
            version: 1,
          },
        },
      },
      include: {
        drafts: true,
      },
    });

    return NextResponse.json({ success: true, contentId: content.id });
  } catch (error) {
    console.error("[DRAFT POST API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getOrCreateUser();

    // Delete all draft/pending contents for this user
    await prisma.content.deleteMany({
      where: {
        userId: user.id,
        status: { in: ["draft", "pending_generation"] },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DRAFT DELETE API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete draft" },
      { status: 500 }
    );
  }
}
