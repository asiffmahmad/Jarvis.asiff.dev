import type { ScheduledJob, JobType } from "./types";

type Listener = (jobs: ScheduledJob[]) => void;

/**
 * Mock Queue Engine Singleton
 * Simulates a background worker like BullMQ processing jobs.
 */
export class QueueEngine {
  private static instance: QueueEngine;
  private jobs: ScheduledJob[] = [];
  private listeners: Set<Listener> = new Set();
  private timer: NodeJS.Timeout | null = null;

  private constructor() {
    this.seedMockJobs();
    this.startWorker();
  }

  public static getInstance(): QueueEngine {
    if (!QueueEngine.instance) {
      QueueEngine.instance = new QueueEngine();
    }
    return QueueEngine.instance;
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.jobs]); // Initial sync
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const data = [...this.jobs].sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    this.listeners.forEach(l => l(data));
  }

  // ---- Public API ----

  public getJobs(): ScheduledJob[] {
    return [...this.jobs];
  }

  public addJob(title: string, type: JobType, scheduledFor: Date, payload: unknown = {}): ScheduledJob {
    const job: ScheduledJob = {
      id: `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title,
      type,
      status: "SCHEDULED",
      createdAt: new Date(),
      scheduledFor,
      payload,
      retryConfig: { maxRetries: 3, currentAttempt: 0, backoffMinutes: 1 },
      logs: [{
        id: `log_${Date.now()}`,
        jobId: "",
        timestamp: new Date(),
        level: "INFO",
        message: "Job created and scheduled."
      }]
    };
    job.logs[0].jobId = job.id;
    this.jobs.push(job);
    this.notify();
    return job;
  }

  public cancelJob(id: string) {
    const job = this.jobs.find(j => j.id === id);
    if (job && !["SUCCESS", "FAILED", "CANCELLED"].includes(job.status)) {
      job.status = "CANCELLED";
      this.addLog(job, "WARN", "Job cancelled by user.");
      this.notify();
    }
  }

  public retryJob(id: string) {
    const job = this.jobs.find(j => j.id === id);
    if (job && (job.status === "FAILED" || job.status === "CANCELLED")) {
      job.status = "SCHEDULED";
      job.errorReason = undefined;
      job.scheduledFor = new Date(Date.now() + 5000); // schedule 5 seconds from now
      job.retryConfig.currentAttempt += 1;
      this.addLog(job, "INFO", `Manual retry initiated. Attempt ${job.retryConfig.currentAttempt}.`);
      this.notify();
    }
  }

  public runNow(id: string) {
    const job = this.jobs.find(j => j.id === id);
    if (job && !["RUNNING", "SUCCESS", "CANCELLED"].includes(job.status)) {
      job.status = "WAITING";
      job.scheduledFor = new Date(); // set to now
      this.addLog(job, "INFO", "Forced immediate execution.");
      this.notify();
    }
  }

  // ---- Internal Worker Logic ----

  private addLog(job: ScheduledJob, level: "INFO"|"WARN"|"ERROR", message: string) {
    job.logs.push({
      id: `log_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      jobId: job.id,
      timestamp: new Date(),
      level,
      message
    });
  }

  private startWorker() {
    if (this.timer) clearInterval(this.timer);
    // Poll every 2 seconds to simulate background worker checking queue
    this.timer = setInterval(() => {
      this.processQueue();
    }, 2000);
  }

  private processQueue() {
    const now = new Date();
    let changed = false;

    for (const job of this.jobs) {
      // 1. Move SCHEDULED -> WAITING if time is up
      if (job.status === "SCHEDULED" && job.scheduledFor <= now) {
        job.status = "WAITING";
        this.addLog(job, "INFO", "Time reached. Moving to waiting queue.");
        changed = true;
      }

      // 2. Pick up WAITING -> RUNNING
      if (job.status === "WAITING") {
        job.status = "RUNNING";
        job.startedAt = new Date();
        this.addLog(job, "INFO", "Worker picked up job. Execution started.");
        
        // Simulate execution time (random 3-8 seconds)
        const execTime = Math.floor(Math.random() * 5000) + 3000;
        
        setTimeout(() => {
          // 80% success rate
          const success = Math.random() > 0.2;
          
          if (success) {
            job.status = "SUCCESS";
            job.completedAt = new Date();
            this.addLog(job, "INFO", "Job completed successfully.");
          } else {
            this.handleFailure(job);
          }
          this.notify();
        }, execTime);
        
        changed = true;
      }
    }

    if (changed) {
      this.notify();
    }
  }

  private handleFailure(job: ScheduledJob) {
    job.status = "FAILED";
    job.completedAt = new Date();
    job.errorReason = "Connection timeout to external API.";
    this.addLog(job, "ERROR", `Execution failed: ${job.errorReason}`);

    if (job.retryConfig.currentAttempt < job.retryConfig.maxRetries) {
      job.retryConfig.currentAttempt++;
      // Auto retry backoff
      const backoffMs = job.retryConfig.backoffMinutes * 60 * 1000;
      job.scheduledFor = new Date(Date.now() + backoffMs);
      job.status = "SCHEDULED";
      this.addLog(job, "INFO", `Scheduling auto-retry ${job.retryConfig.currentAttempt}/${job.retryConfig.maxRetries} for ${job.scheduledFor.toLocaleTimeString()}`);
    } else {
      this.addLog(job, "ERROR", "Max retries reached. Marking as fatal.");
    }
  }

  private seedMockJobs() {
    const now = Date.now();
    
    // Create a few past jobs
    this.addJob("Publish UI V2 Post", "SOCIAL_POST", new Date(now - 100000));
    this.jobs[0].status = "SUCCESS";
    this.jobs[0].completedAt = new Date(now - 90000);
    this.jobs[0].startedAt = new Date(now - 95000);

    this.addJob("Daily AI News Scraping", "AI_RESEARCH", new Date(now - 50000));
    this.jobs[1].status = "FAILED";
    this.jobs[1].retryConfig.currentAttempt = 3;
    this.jobs[1].errorReason = "Rate limit exceeded on provider.";

    // Upcoming job
    this.addJob("Send Welcome Campaign", "EMAIL_SEND", new Date(now + 15000)); // 15s in future
    this.addJob("Generate Weekly Report", "SYSTEM_MAINTENANCE", new Date(now + 60000)); // 1m in future
  }
}
