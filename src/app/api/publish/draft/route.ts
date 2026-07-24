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
    
    // Find all content items of status 'draft' or 'pending_generation'
    const contentItems = await prisma.content.findMany({
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

    const drafts = contentItems.map(item => {
      const latestDraft = item.drafts[0];
      const parsedData = latestDraft ? JSON.parse(latestDraft.body) : null;
      
      return {
        id: item.id,
        status: item.status,
        title: item.title,
        updatedAt: item.updatedAt.toISOString(),
        post: item.status === "draft" ? parsedData as PostData : null,
        pendingGen: item.status === "pending_generation" ? parsedData as PendingGeneration : null,
      };
    });
    
    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("[DRAFT GET API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser();
    const body = await req.json();
    const { post, pendingGen, contentId } = body;

    if (!post && !pendingGen) {
      return NextResponse.json({ error: "post or pendingGen data is required" }, { status: 400 });
    }

    const isPending = !!pendingGen;
    const title = isPending ? pendingGen.topic : (post.title || "Untitled Draft");
    const status = isPending ? "pending_generation" : "draft";
    const payload = isPending ? pendingGen : post;

    let content;

    if (contentId) {
      // Update existing content
      content = await prisma.content.update({
        where: { id: contentId },
        data: {
          title: title || "Untitled Draft",
          status: status,
          updatedAt: new Date(),
        },
        include: {
          drafts: {
            orderBy: {
              version: "desc",
            },
            take: 1,
          },
        },
      });

      const latestDraft = content.drafts[0];
      const nextVersion = latestDraft ? latestDraft.version + 1 : 1;

      // Create a new draft version
      await prisma.contentDraft.create({
        data: {
          contentId: content.id,
          body: JSON.stringify(payload),
          version: nextVersion,
        },
      });
    } else {
      // Create new Content draft (allowing multiple active drafts)
      content = await prisma.content.create({
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
    }

    return NextResponse.json({ success: true, contentId: content.id });
  } catch (error) {
    console.error("[DRAFT POST API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
    }

    await prisma.content.delete({
      where: { id },
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
