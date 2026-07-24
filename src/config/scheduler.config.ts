export const SCHEDULER_CONFIG = {
  cron: {
    dailyBriefing: "0 8 * * *", // 8 AM every day
    weeklyReport: "0 9 * * 1",  // 9 AM every Monday
    databaseBackup: "0 2 * * *", // 2 AM every day
  },
  batching: {
    maxConcurrentWorkflows: 5,
    emailBatchSize: 50,
  }
} as const;
