/**
 * JARVIS Dashboard Services
 *
 * Provides strongly-typed placeholder data for the Mission Control Dashboard widgets.
 * This abstracts data fetching, allowing the UI to remain unchanged when
 * real backend APIs are integrated.
 */

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

export async function fetchDashboardData(): Promise<DashboardData> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    aiStatus: {
      provider: "Groq",
      model: "Llama 3 70B",
      tokenUsage: 1450230,
      activeConversations: 3,
      currentTasks: 2,
      responseTimeMs: 240,
      status: "operational",
    },
    automationStatus: {
      running: 4,
      queued: 12,
      failed: 0,
      completed: 156,
      processing: true,
    },
    schedule: [
      { id: "1", title: "Publish Tech Newsletter", type: "email", time: "10:00 AM" },
      { id: "2", title: "LinkedIn AI Post", type: "content", time: "11:30 AM" },
      { id: "3", title: "Team Sync", type: "event", time: "2:00 PM" },
      { id: "4", title: "Review Drafts", type: "task", time: "4:00 PM" },
    ],
    recentActivity: [
      { id: "1", title: "Content Generated", description: "Drafted 3 tweets", type: "ai", timestamp: "5m ago" },
      { id: "2", title: "Email Sent", description: "Weekly update dispatched", type: "email", timestamp: "15m ago" },
      { id: "3", title: "Research Finished", description: "Analyzed 5 competitor blogs", type: "research", timestamp: "1h ago" },
      { id: "4", title: "Automation Completed", description: "Daily cleanup routine", type: "automation", timestamp: "2h ago" },
    ],
    systemHealth: {
      app: "healthy",
      database: "healthy",
      api: "healthy",
      ai: "healthy",
      storageUsagePct: 42,
      memoryUsagePct: 68,
    },
    emailSummary: {
      unread: 14,
      important: 3,
      drafts: 8,
      scheduled: 2,
      aiSuggested: 5,
    },
    analytics: {
      views: { total: 24500, trend: 12.5 },
      followers: { total: 1240, trend: 3.2 },
      reach: { total: 89000, trend: 8.4 },
      engagement: { total: 4500, trend: -1.2 },
    },
    latestResearch: [
      { id: "1", title: "New LLM Benchmark Released", source: "TechCrunch", type: "news" },
      { id: "2", title: "Optimal Prompting Strategies", source: "ArXiv", type: "bookmark" },
      { id: "3", title: "AI in Content Marketing 2024", source: "Trend Report", type: "trend" },
    ],
    connectedServices: [
      { id: "groq", name: "Groq", status: "connected" },
      { id: "gmail", name: "Gmail", status: "syncing" },
      { id: "x", name: "X (Twitter)", status: "connected" },
      { id: "linkedin", name: "LinkedIn", status: "connected" },
      { id: "openai", name: "OpenAI", status: "disconnected" },
      { id: "github", name: "GitHub", status: "connected" },
    ],
  };
}
