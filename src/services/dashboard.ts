export interface AIStatusData {
  provider: string;
  model: string;
  tokenUsage: number;
  activeConversations: number;
  currentTasks: number;
  responseTimeMs: number;
  status: "operational" | "degraded" | "offline";
}

export interface AutomationStatusData {
  running: number;
  queued: number;
  failed: number;
  completed: number;
  processing: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: "content" | "email" | "event" | "task";
  time: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  type: "email" | "content" | "ai" | "automation" | "research";
  timestamp: string;
}

export interface SystemHealthData {
  app: "healthy" | "degraded" | "down";
  database: "healthy" | "degraded" | "down";
  api: "healthy" | "degraded" | "down";
  ai: "healthy" | "degraded" | "down";
  storageUsagePct: number;
  memoryUsagePct: number;
}

export interface EmailSummaryData {
  unread: number;
  important: number;
  drafts: number;
  scheduled: number;
  aiSuggested: number;
}

export interface AnalyticsData {
  views: { total: number; trend: number };
  followers: { total: number; trend: number };
  reach: { total: number; trend: number };
  engagement: { total: number; trend: number };
}

export interface ResearchItem {
  id: string;
  title: string;
  source: string;
  type: "news" | "bookmark" | "trend";
}

export interface ConnectedService {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error" | "syncing";
}

export interface DashboardData {
  aiStatus: AIStatusData;
  automationStatus: AutomationStatusData;
  schedule: ScheduleItem[];
  recentActivity: ActivityItem[];
  systemHealth: SystemHealthData;
  emailSummary: EmailSummaryData;
  analytics: AnalyticsData;
  latestResearch: ResearchItem[];
  connectedServices: ConnectedService[];
}
