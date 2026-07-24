export const INTEGRATIONS_CONFIG = {
  platforms: {
    github: { id: "github", name: "GitHub" },
    notion: { id: "notion", name: "Notion" },
    slack: { id: "slack", name: "Slack" },
    twitter: { id: "twitter", name: "Twitter / X" },
    linkedin: { id: "linkedin", name: "LinkedIn" },
    gmail: { id: "gmail", name: "Gmail" }
  },
  polling: {
    feedRefreshIntervalMs: 15 * 60 * 1000, // 15 mins
    webhookTimeoutMs: 10000,
  }
} as const;
