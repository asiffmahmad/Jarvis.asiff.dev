import { NextResponse } from "next/server";
import { QueueEngine } from "@/lib/scheduler/queue-engine";
import type { SchedulePostRequest, SchedulePostResponse } from "@/lib/publishing/types";

export async function POST(req: Request) {
  try {
    const body: SchedulePostRequest = await req.json();
    const { post, platform, scheduleFor, accountId } = body;

    if (!post || !platform || !scheduleFor || !accountId) {
      return NextResponse.json(
        { error: "post, platform, scheduleFor, and accountId are required" },
        { status: 400 }
      );
    }

    const engine = QueueEngine.getInstance();
    const scheduledDate = new Date(scheduleFor);

    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduleFor date" },
        { status: 400 }
      );
    }

    const job = engine.addJob(
      `Post to ${platform}: ${post.title}`,
      "SOCIAL_POST",
      scheduledDate,
      {
        post,
        platform,
        accountId,
        generatedAt: post.createdAt,
      }
    );

    const response: SchedulePostResponse = {
      jobId: job.id,
      status: job.status,
      scheduledFor: job.scheduledFor.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    console.error("[PUBLISH SCHEDULE API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to schedule post" },
      { status: 500 }
    );
  }
}
