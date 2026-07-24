export const APP_CONFIG = {
  name: "JARVIS Operating System",
  version: "1.0.0",
  urls: {
    marketing: "https://jarvis.example.com",
    dashboard: "/",
    missionControl: "/",
  },
  agents: {
    research: "agent-research",
    content: "agent-content",
    email: "agent-email",
    scheduler: "agent-scheduler",
    analytics: "agent-analytics",
    automation: "agent-automation",
  },
  featureFlags: {
    enableAiAssistant: process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === "true",
    enableVoiceCommands: false, // Future
  }
} as const;
