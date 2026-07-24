import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type { ScheduledJob, JobLog } from "@/lib/scheduler/types";
import type { SchedulePostRequest } from "@/lib/publishing/types";

// Helper to map DB row to ScheduledJob format
function mapRowToJob(row: any): ScheduledJob {
  let parsed = { payload: {}, logs: [] as JobLog[], retryConfig: { maxRetries: 3, currentAttempt: 0, backoffMinutes: 1 } };
  try {
    if (row.targetId) {
      parsed = JSON.parse(row.targetId);
    }
  } catch (err) {
    console.error("Failed to parse targetId payload:", err);
  }

  return {
    id: row.id,
    title: row.cronExpression || "Untitled Job",
    type: row.type as any,
    status: row.status as any,
    createdAt: row.createdAt,
    scheduledFor: row.runAt || row.createdAt,
    payload: parsed.payload,
    retryConfig: parsed.retryConfig || { maxRetries: 3, currentAttempt: 0, backoffMinutes: 1 },
    logs: parsed.logs || [],
    errorReason: (parsed as any).errorReason,
  };
}

// Helper to map ScheduledJob back to targetId JSON string
function serializeJobDetails(payload: any, logs: any[], retryConfig: any, errorReason?: string) {
  return JSON.stringify({ payload, logs, retryConfig, errorReason });
}

export async function GET() {
  try {
    const jobs = await prisma.scheduleJob.findMany({
      orderBy: { runAt: "asc" },
    });
    
    return NextResponse.json({
      jobs: jobs.map(mapRowToJob),
    });
  } catch (error) {
    console.error("[SCHEDULE GET API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch scheduled jobs" },
      { status: 500 }
    );
  }
}

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

    const scheduledDate = new Date(scheduleFor);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid scheduleFor date" }, { status: 400 });
    }

    const jobId = `job_${Date.now()}`;
    const initialLogs: JobLog[] = [{
      id: `log_${Date.now()}`,
      jobId,
      timestamp: new Date(),
      level: "INFO",
      message: "Job created and scheduled in database.",
    }];

    const detailsStr = serializeJobDetails(
      { post, platform, accountId, generatedAt: post.createdAt },
      initialLogs,
      { maxRetries: 3, currentAttempt: 0, backoffMinutes: 1 }
    );

    const row = await prisma.scheduleJob.create({
      data: {
        id: jobId,
        type: "SOCIAL_POST",
        status: "SCHEDULED",
        runAt: scheduledDate,
        cronExpression: `Post to ${platform}: ${post.title}`,
        targetId: detailsStr,
      },
    });

    return NextResponse.json({
      jobId: row.id,
      status: row.status,
      scheduledFor: row.runAt?.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("[SCHEDULE POST API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to schedule post" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { action, jobId } = await req.json();

    if (!action || !jobId) {
      return NextResponse.json({ error: "action and jobId are required" }, { status: 400 });
    }

    const row = await prisma.scheduleJob.findUnique({
      where: { id: jobId },
    });

    if (!row) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    let parsed = { payload: {}, logs: [] as JobLog[], retryConfig: { maxRetries: 3, currentAttempt: 0, backoffMinutes: 1 } };
    try {
      if (row.targetId) {
        parsed = JSON.parse(row.targetId);
      }
    } catch {}

    let nextStatus = row.status;
    let nextRunAt = row.runAt;

    if (action === "cancel") {
      if (!["SUCCESS", "FAILED", "CANCELLED"].includes(row.status)) {
        nextStatus = "CANCELLED";
        parsed.logs.push({
          id: `log_${Date.now()}`,
          jobId: row.id,
          timestamp: new Date(),
          level: "WARN",
          message: "Job cancelled by user.",
        });
      }
    } else if (action === "retry") {
      if (["FAILED", "CANCELLED"].includes(row.status)) {
        nextStatus = "SCHEDULED";
        nextRunAt = new Date(Date.now() + 5000);
        parsed.retryConfig.currentAttempt += 1;
        parsed.logs.push({
          id: `log_${Date.now()}`,
          jobId: row.id,
          timestamp: new Date(),
          level: "INFO",
          message: `Manual retry initiated. Attempt ${parsed.retryConfig.currentAttempt}.`,
        });
      }
    } else if (action === "run_now") {
      if (!["RUNNING", "SUCCESS", "CANCELLED"].includes(row.status)) {
        nextStatus = "RUNNING";
        parsed.logs.push({
          id: `log_${Date.now()}`,
          jobId: row.id,
          timestamp: new Date(),
          level: "INFO",
          message: "Job execution triggered manually.",
        });
      }
    }

    const updated = await prisma.scheduleJob.update({
      where: { id: jobId },
      data: {
        status: nextStatus,
        runAt: nextRunAt,
        targetId: serializeJobDetails(parsed.payload, parsed.logs, parsed.retryConfig),
      },
    });

    return NextResponse.json(mapRowToJob(updated));
  } catch (error) {
    console.error("[SCHEDULE PUT API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update job" },
      { status: 500 }
    );
  }
}
