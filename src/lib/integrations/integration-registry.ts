import type { IntegrationProvider, IntegrationId } from "./types";

export class IntegrationRegistry {
  private static instance: IntegrationRegistry;
  private providers: Map<IntegrationId, IntegrationProvider> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): IntegrationRegistry {
    if (!IntegrationRegistry.instance) {
      IntegrationRegistry.instance = new IntegrationRegistry();
    }
    return IntegrationRegistry.instance;
  }

  private registerDefaults() {
    const defaultProviders: IntegrationProvider[] = [
      // Active Integrations
      {
        id: "groq", name: "Groq", category: "ai", authType: "apikey", brandColor: "#F55036", isAvailable: true,
        capabilities: { chat: true, streaming: true, embeddings: false, imageGeneration: false }
      },
      {
        id: "gmail", name: "Gmail", category: "communication", authType: "oauth", brandColor: "#EA4335", isAvailable: true,
        capabilities: { messaging: true, notifications: true, search: true }
      },
      
      // Future AI
      {
        id: "openai", name: "OpenAI", category: "ai", authType: "apikey", brandColor: "#10A37F", isAvailable: false,
        capabilities: { chat: true, embeddings: true, imageGeneration: true, streaming: true }
      },
      {
        id: "claude", name: "Anthropic Claude", category: "ai", authType: "apikey", brandColor: "#D97757", isAvailable: false,
        capabilities: { chat: true, streaming: true, embeddings: false }
      },
      {
        id: "gemini", name: "Google Gemini", category: "ai", authType: "apikey", brandColor: "#4285F4", isAvailable: false,
        capabilities: { chat: true, streaming: true, embeddings: true }
      },
      {
        id: "ollama", name: "Ollama (Local)", category: "ai", authType: "apikey", brandColor: "#000000", isAvailable: false,
        capabilities: { chat: true, streaming: true, embeddings: true }
      },

      // Future Productivity
      {
        id: "notion", name: "Notion", category: "productivity", authType: "oauth", brandColor: "#000000", isAvailable: false,
        capabilities: { search: true, upload: true, download: true }
      },
      {
        id: "googledrive", name: "Google Drive", category: "storage", authType: "oauth", brandColor: "#0F9D58", isAvailable: false,
        capabilities: { search: true, upload: true, download: true }
      },

      // Future Communication
      {
        id: "slack", name: "Slack", category: "communication", authType: "oauth", brandColor: "#4A154B", isAvailable: false,
        capabilities: { messaging: true, notifications: true }
      },
      {
        id: "discord", name: "Discord", category: "communication", authType: "oauth", brandColor: "#5865F2", isAvailable: false,
        capabilities: { messaging: true, notifications: true }
      },

      // Future Developer
      {
        id: "github", name: "GitHub", category: "developer", authType: "pat", brandColor: "#181717", isAvailable: false,
        capabilities: { repository: true, issues: true }
      },
      {
        id: "gitlab", name: "GitLab", category: "developer", authType: "pat", brandColor: "#FC6D26", isAvailable: false,
        capabilities: { repository: true, issues: true }
      },
      {
        id: "jira", name: "Jira", category: "developer", authType: "oauth", brandColor: "#0052CC", isAvailable: false,
        capabilities: { issues: true }
      },
      {
        id: "linear", name: "Linear", category: "developer", authType: "apikey", brandColor: "#5E6AD2", isAvailable: false,
        capabilities: { issues: true }
      }
    ];

    defaultProviders.forEach(p => this.providers.set(p.id, p));
  }

  public getProviders(): IntegrationProvider[] {
    return Array.from(this.providers.values());
  }

  public getProvider(id: IntegrationId): IntegrationProvider | undefined {
    return this.providers.get(id);
  }
}
