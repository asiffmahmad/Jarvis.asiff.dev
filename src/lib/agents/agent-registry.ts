import type { AgentDefinition } from "./types";

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, AgentDefinition> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private registerDefaults() {
    const defaultAgents: AgentDefinition[] = [
      { id: "agent_research", name: "Research Agent", description: "Searches the web and aggregates summaries into the Knowledge Hub.", category: "research", isEnabled: true, capabilities: ["Web Search", "Summarization", "Data Extraction"], mockDelayMs: 4000 },
      { id: "agent_content", name: "Content Creator", description: "Drafts high-quality posts and articles based on prompts.", category: "content", isEnabled: true, capabilities: ["Copywriting", "SEO Optimization"], mockDelayMs: 3000 },
      { id: "agent_email", name: "Email Assistant", description: "Drafts replies to incoming emails. Requires manual approval to send.", category: "email", isEnabled: true, capabilities: ["Drafting", "Context Analysis"], mockDelayMs: 2500 },
      { id: "agent_caption", name: "Caption Generator", description: "Creates viral social media captions with hashtags.", category: "social", isEnabled: true, capabilities: ["Social Media", "Hashtag Generation"], mockDelayMs: 2000 },
      
      // Future architecture placeholders
      { id: "agent_seo", name: "SEO Optimizer", description: "Analyzes content for keyword optimization.", category: "seo", isEnabled: false, capabilities: ["Keyword Research"] },
      { id: "agent_coding", name: "Code Assistant", description: "Autonomous software engineer.", category: "coding", isEnabled: false, capabilities: ["Code Gen", "Debugging"] },
    ];

    defaultAgents.forEach(a => this.agents.set(a.id, a));
  }

  public getAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  public getAgent(id: string): AgentDefinition | undefined {
    return this.agents.get(id);
  }
}
