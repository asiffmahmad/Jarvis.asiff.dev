export type JobStatus = 
  | "DRAFT" 
  | "SCHEDULED" 
  | "WAITING" 
  | "RUNNING" 
  | "SUCCESS" 
  | "FAILED" 
  | "CANCELLED" 
  | "ARCHIVED";

export type JobType = 
  | "CONTENT_PUBLISH" 
  | "EMAIL_SEND" 
  | "AI_RESEARCH" 
  | "SOCIAL_POST" 
  | "SYSTEM_MAINTENANCE";

export interface JobLog {
  id: string;
  jobId: string;
  timestamp: Date;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  metadata?: unknown;
}

export interface RetryConfig {
  maxRetries: number;
  currentAttempt: number;
  backoffMinutes: number; // How long to wait before retrying
}

export interface ScheduledJob {
  id: string;
  title: string;
  type: JobType;
  status: JobStatus;
  
  // Timing
  createdAt: Date;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Payload
  payload: unknown;
  
  // Execution
  retryConfig: RetryConfig;
  logs: JobLog[];
  errorReason?: string;
}
