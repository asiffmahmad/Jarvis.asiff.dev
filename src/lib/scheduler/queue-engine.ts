import type { ScheduledJob, JobType } from "./types";

type Listener = (jobs: ScheduledJob[]) => void;

export class QueueEngine {
  private static instance: QueueEngine;
  private jobs: ScheduledJob[] = [];
  private listeners: Set<Listener> = new Set();

  private constructor() {}

  public static getInstance(): QueueEngine {
    if (!QueueEngine.instance) {
      QueueEngine.instance = new QueueEngine();
    }
    return QueueEngine.instance;
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.jobs]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const data = [...this.jobs].sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    this.listeners.forEach(l => l(data));
  }

  public getJobs(): ScheduledJob[] {
    return [...this.jobs];
  }

  public addJob(title: string, type: JobType, scheduledFor: Date, payload: unknown = {}): ScheduledJob {
    const job: ScheduledJob = {
      id: `job_${Date.now()}`,
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
      job.logs.push({
        id: `log_${Date.now()}`,
        jobId: job.id,
        timestamp: new Date(),
        level: "WARN",
        message: "Job cancelled by user."
      });
      this.notify();
    }
  }

  public retryJob(id: string) {
    const job = this.jobs.find(j => j.id === id);
    if (job && (job.status === "FAILED" || job.status === "CANCELLED")) {
      job.status = "SCHEDULED";
      job.errorReason = undefined;
      job.scheduledFor = new Date(Date.now() + 5000);
      job.retryConfig.currentAttempt += 1;
      job.logs.push({
        id: `log_${Date.now()}`,
        jobId: job.id,
        timestamp: new Date(),
        level: "INFO",
        message: `Manual retry initiated. Attempt ${job.retryConfig.currentAttempt}.`
      });
      this.notify();
    }
  }

  public runNow(id: string) {
    const job = this.jobs.find(j => j.id === id);
    if (job && !["RUNNING", "SUCCESS", "CANCELLED"].includes(job.status)) {
      job.status = "RUNNING";
      job.startedAt = new Date();
      job.logs.push({
        id: `log_${Date.now()}`,
        jobId: job.id,
        timestamp: new Date(),
        level: "INFO",
        message: "Forced immediate execution."
      });
      this.notify();
    }
  }
}
