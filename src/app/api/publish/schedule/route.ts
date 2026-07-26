import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type { ScheduledJob, JobLog } from "@/lib/scheduler/types";
import type { SchedulePostRequest } from "@/lib/publishing/types";
import { POST as analyzePOST } from "../../expenses/analyze/route";

export const dynamic = "force-dynamic";

// Helper to map DB row to ScheduledJob format
function mapRowToJob(row: any): ScheduledJob {
  let parsed: any = { payload: {}, logs: [] as JobLog[], retryConfig: { maxRetries: 3, currentAttempt: 0, backoffMinutes: 1 } };
  try {
    if (row.targetId) {
      const p = JSON.parse(row.targetId);
      if (p && typeof p === 'object') {
        parsed = p;
      }
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

import { TwitterApi } from "twitter-api-v2";

// Helper to map ScheduledJob back to targetId JSON string
function serializeJobDetails(payload: any, logs: any[], retryConfig: any, errorReason?: string) {
  return JSON.stringify({ payload, logs, retryConfig, errorReason });
}

// OAuth Helper to get and refresh Gmail access tokens dynamically from the database
async function getFreshGmailAccessToken() {
  const prisma = (await import("@/lib/db/prisma")).default;
  const account = await prisma.platformAccount.findFirst({
    where: { platformId: "gmail" },
  });

  if (!account) {
    throw new Error("No Gmail account connected in the database.");
  }

  if (account.expiresAt && account.expiresAt.getTime() > Date.now() + 60000) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    throw new Error("Gmail token is expired and no refresh token is available.");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: account.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to refresh Google access token: ${errText}`);
  }

  const data = await res.json();
  const newAccessToken = data.access_token;
  const newExpiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);

  await prisma.platformAccount.update({
    where: { id: account.id },
    data: {
      accessToken: newAccessToken,
      expiresAt: newExpiresAt,
    },
  });

  return newAccessToken;
}

// Background Gmail poll logic
async function executeEmailPollJob(jobId: string, parsedLogs: any[]) {
  try {
    const token = await getFreshGmailAccessToken();
    const query = "subject:(receipt OR invoice OR bill OR billing OR payment OR order OR subscription OR charge OR axis OR hdfc OR debit OR credit OR credited OR transaction)";
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!listRes.ok) {
      throw new Error(`Failed to query Gmail API: ${listRes.statusText}`);
    }

    const listData = await listRes.json();
    const messages = listData.messages || [];

    if (messages.length === 0) {
      parsedLogs.push({
        id: `log_${Date.now()}`,
        jobId,
        timestamp: new Date(),
        level: "INFO",
        message: "No matching receipt/invoice emails found in Gmail inbox.",
      });
      return;
    }

    let importedCount = 0;
    const prisma = (await import("@/lib/db/prisma")).default;

    for (const msgRef of messages) {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!msgRes.ok) continue;
      const message = await msgRes.json();

      const headers = message.payload?.headers || [];
      const subjectHeader = headers.find((h: any) => h.name?.toLowerCase() === "subject");
      const subject = subjectHeader ? subjectHeader.value : "No Subject";

      const existing = await prisma.expense.findFirst({
        where: { rawEmailSubject: subject },
      });
      if (existing) continue;

      let bodyText = message.snippet || "";
      const parts = message.payload?.parts;
      if (parts && parts.length > 0) {
        const textPart = parts.find((p: any) => p.mimeType === "text/plain");
        if (textPart && textPart.body?.data) {
          bodyText = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      } else if (message.payload?.body?.data) {
        bodyText = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
      }

      const mockReq = new Request("http://127.0.0.1/api/expenses/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body: bodyText }),
      });
      const analyzeRes = await analyzePOST(mockReq);

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        if (analyzeData.isExpense) {
          importedCount++;
        }
      }
    }

    parsedLogs.push({
      id: `log_${Date.now()}`,
      jobId,
      timestamp: new Date(),
      level: "INFO",
      message: `Gmail background check complete. Checked ${messages.length} messages, imported ${importedCount} new expenses.`,
    });
  } catch (error: any) {
    parsedLogs.push({
      id: `log_${Date.now()}`,
      jobId,
      timestamp: new Date(),
      level: "ERROR",
      message: `Gmail background check failed: ${error.message}`,
    });
    throw error;
  }
}

// Background executor for due scheduled jobs
async function executeDueJobs() {
  try {
    const now = new Date();
    // Find all jobs that are scheduled and due
    const dueJobs = await prisma.scheduleJob.findMany({
      where: {
        status: "SCHEDULED",
        runAt: { lte: now },
      },
    });

    for (const job of dueJobs) {
      try {
        // 1. Update status to RUNNING
        await prisma.scheduleJob.update({
          where: { id: job.id },
          data: { status: "RUNNING" },
        });

        let parsed = { payload: {}, logs: [] as JobLog[], retryConfig: { maxRetries: 3, currentAttempt: 0, backoffMinutes: 1 } };
        if (job.targetId) {
          try {
            parsed = JSON.parse(job.targetId);
          } catch {}
        }

        parsed.logs.push({
          id: `log_${Date.now()}`,
          jobId: job.id,
          timestamp: new Date(),
          level: "INFO",
          message: "Starting scheduled job execution...",
        });

        // 2. Execute job based on type
        if (job.type === "email_poll") {
          await executeEmailPollJob(job.id, parsed.logs);
        } else {
          const payload = parsed.payload as any;
          const platform = payload.platform;
          
          parsed.logs.push({
            id: `log_${Date.now()}`,
            jobId: job.id,
            timestamp: new Date(),
            level: "INFO",
            message: `Posting draft content to target account: ${payload.accountId || "Default Account"} on ${platform}.`,
          });

          if (platform === "x") {
          // Verify environment variables for X
          const appKey = process.env.X_API_KEY;
          const appSecret = process.env.X_API_SECRET;
          const accessToken = process.env.X_ACCESS_TOKEN;
          const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

          if (!appKey || !appSecret || !accessToken || !accessSecret) {
            throw new Error("Missing X API keys or access tokens in environment configuration.");
          }

          const twitterClient = new TwitterApi({
            appKey,
            appSecret,
            accessToken,
            accessSecret,
          });

          // Perform the actual tweet post
          const tweetText = payload.post?.caption || payload.post?.content || "Automated post from JARVIS";
          const tweetRes = await twitterClient.v2.tweet(tweetText);

          parsed.logs.push({
            id: `log_${Date.now()}`,
            jobId: job.id,
            timestamp: new Date(),
            level: "INFO",
            message: `Successfully published tweet! ID: ${tweetRes.data.id}`,
          });
        } else if (platform === "linkedin") {
          const token = process.env.LINKEDIN_ACCESS_TOKEN;
          if (!token) {
            throw new Error("Missing LINKEDIN_ACCESS_TOKEN in environment configuration.");
          }

          // 1. Get URN
          let personId = "";
          const meRes = await fetch("https://api.linkedin.com/v2/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (meRes.ok) {
            const meData = await meRes.json();
            personId = meData.id;
          } else {
            const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!userinfoRes.ok) {
              throw new Error(`LinkedIn authentication failed: ${userinfoRes.statusText}`);
            }
            const userinfoData = await userinfoRes.json();
            personId = userinfoData.sub;
          }

          if (!personId) {
            throw new Error("Could not retrieve LinkedIn profile ID.");
          }

          // 2. Post Share
          const postText = payload.post?.caption || payload.post?.content || "Automated post from JARVIS";
          const shareRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Restli-Protocol-Version": "2.0.0",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              author: `urn:li:person:${personId}`,
              lifecycleState: "PUBLISHED",
              specificContent: {
                "com.linkedin.ugc.ShareContent": {
                  "shareCommentary": {
                    "text": postText
                  },
                  "shareMediaCategory": "NONE"
                }
              },
              visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
              }
            })
          });

          if (!shareRes.ok) {
            const errData = await shareRes.json().catch(() => ({}));
            throw new Error(`LinkedIn share failed: ${errData.message || shareRes.statusText}`);
          }

          const shareData = await shareRes.json();

          parsed.logs.push({
            id: `log_${Date.now()}`,
            jobId: job.id,
            timestamp: new Date(),
            level: "INFO",
            message: `Successfully published to LinkedIn! Share URN: ${shareData.id}`,
          });
        } else {
          // Simulate for other platforms
          parsed.logs.push({
            id: `log_${Date.now()}`,
            jobId: job.id,
            timestamp: new Date(),
            level: "INFO",
            message: `Successfully published content to ${platform || "social media platform"}. (Simulated)`,
          });
        }
        }

        // 3. Update status to SUCCESS
        await prisma.scheduleJob.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            targetId: serializeJobDetails(parsed.payload, parsed.logs, parsed.retryConfig),
          },
        });
      } catch (jobErr) {
        console.error(`Failed to process job ${job.id}:`, jobErr);
        try {
          let parsed = { payload: {}, logs: [] as JobLog[], retryConfig: { maxRetries: 3, currentAttempt: 0, backoffMinutes: 1 } };
          if (job.targetId) {
            try {
              parsed = JSON.parse(job.targetId);
            } catch {}
          }
          parsed.logs.push({
            id: `log_${Date.now()}`,
            jobId: job.id,
            timestamp: new Date(),
            level: "ERROR",
            message: `Execution failed: ${(jobErr as Error).message}`,
          });
          await prisma.scheduleJob.update({
            where: { id: job.id },
            data: {
              status: "FAILED",
              targetId: serializeJobDetails(parsed.payload, parsed.logs, parsed.retryConfig, (jobErr as Error).message),
            },
          });
        } catch (dbErr) {
          console.error("Failed to write job failure logs:", dbErr);
        }
      }
    }
  } catch (err) {
    console.error("Error running executeDueJobs check:", err);
  }
}

export async function GET() {
  try {
    // Check and trigger any scheduled jobs that are due
    await executeDueJobs();

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

        // Execute immediately in background
        setTimeout(async () => {
          try {
            if (row.type === "email_poll") {
              await executeEmailPollJob(row.id, parsed.logs);
            } else {
              const payload = parsed.payload as any;
              const platform = payload.platform;
              
              parsed.logs.push({
                id: `log_${Date.now()}`,
                jobId: row.id,
                timestamp: new Date(),
                level: "INFO",
                message: `Posting draft content to target account: ${payload.accountId || "Default Account"} on ${platform}.`,
              });
            
            if (platform === "x") {
              const appKey = process.env.X_API_KEY;
              const appSecret = process.env.X_API_SECRET;
              const accessToken = process.env.X_ACCESS_TOKEN;
              const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

              if (!appKey || !appSecret || !accessToken || !accessSecret) {
                throw new Error("Missing X API keys or access tokens in environment configuration.");
              }

              const twitterClient = new TwitterApi({
                appKey,
                appSecret,
                accessToken,
                accessSecret,
              });

              const tweetText = payload.post?.caption || payload.post?.content || "Automated post from JARVIS";
              const tweetRes = await twitterClient.v2.tweet(tweetText);

              parsed.logs.push({
                id: `log_${Date.now()}`,
                jobId: row.id,
                timestamp: new Date(),
                level: "INFO",
                message: `Successfully published tweet! ID: ${tweetRes.data.id}`,
              });
            } else if (platform === "linkedin") {
              const token = process.env.LINKEDIN_ACCESS_TOKEN;
              if (!token) {
                throw new Error("Missing LINKEDIN_ACCESS_TOKEN in environment configuration.");
              }

              // 1. Get URN
              let personId = "";
              const meRes = await fetch("https://api.linkedin.com/v2/me", {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (meRes.ok) {
                const meData = await meRes.json();
                personId = meData.id;
              } else {
                const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (!userinfoRes.ok) {
                  throw new Error(`LinkedIn authentication failed: ${userinfoRes.statusText}`);
                }
                const userinfoData = await userinfoRes.json();
                personId = userinfoData.sub;
              }

              if (!personId) {
                throw new Error("Could not retrieve LinkedIn profile ID.");
              }

              // 2. Post Share
              const postText = payload.post?.caption || payload.post?.content || "Automated post from JARVIS";
              const shareRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "X-Restli-Protocol-Version": "2.0.0",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  author: `urn:li:person:${personId}`,
                  lifecycleState: "PUBLISHED",
                  specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                      "shareCommentary": {
                        "text": postText
                      },
                      "shareMediaCategory": "NONE"
                    }
                  },
                  visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                  }
                })
              });

              if (!shareRes.ok) {
                const errData = await shareRes.json().catch(() => ({}));
                throw new Error(`LinkedIn share failed: ${errData.message || shareRes.statusText}`);
              }

              const shareData = await shareRes.json();

              parsed.logs.push({
                id: `log_${Date.now()}`,
                jobId: row.id,
                timestamp: new Date(),
                level: "INFO",
                message: `Successfully published to LinkedIn! Share URN: ${shareData.id}`,
              });
            } else {
              parsed.logs.push({
                id: `log_${Date.now()}`,
                jobId: row.id,
                timestamp: new Date(),
                level: "INFO",
                message: `Successfully published content to ${platform || "social media platform"}. (Simulated)`,
              });
             }
            }
            
            await prisma.scheduleJob.update({
              where: { id: jobId },
              data: {
                status: "SUCCESS",
                targetId: serializeJobDetails(parsed.payload, parsed.logs, parsed.retryConfig),
              },
            });
          } catch (jobErr) {
            console.error(`Failed to process job ${jobId}:`, jobErr);
            parsed.logs.push({
              id: `log_${Date.now()}`,
              jobId: row.id,
              timestamp: new Date(),
              level: "ERROR",
              message: `Execution failed: ${(jobErr as Error).message}`,
            });
            await prisma.scheduleJob.update({
              where: { id: jobId },
              data: {
                status: "FAILED",
                targetId: serializeJobDetails(parsed.payload, parsed.logs, parsed.retryConfig, (jobErr as Error).message),
              },
            });
          }
        }, 10);
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
