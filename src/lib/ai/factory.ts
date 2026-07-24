import { type AIProvider } from "./provider";
import { GroqProvider } from "./groq";
import { OpenRouterProvider } from "./openrouter";
import { getModelForTask, recordModelFailure } from "./model-router";
import type { TaskType } from "./model-router";
import { serverEnv } from "../env";

export type SupportedProviders = "groq" | "openai" | "claude" | "gemini" | "openrouter";

function getAvailableProviders(): Set<string> {
  const available = new Set<string>();
  if (serverEnv.groqApiKey) available.add("groq");
  if (serverEnv.openrouterApiKey) available.add("openrouter");
  return available;
}

export class AIProviderFactory {
  private static providers = new Map<string, AIProvider>([
    ["groq", new GroqProvider()],
    ["openrouter", new OpenRouterProvider()],
  ]);

  static getProvider(providerId: SupportedProviders = "groq"): AIProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`AI Provider '${providerId}' is not implemented or registered.`);
    }
    return provider;
  }

  static getModel(task: TaskType = "balanced") {
    const available = getAvailableProviders();
    const entry = getModelForTask(task, available);
    const provider = this.getProvider(entry.provider as SupportedProviders);
    return provider.getModel({ model: entry.model });
  }

  static reportFailure(providerId: string, model: string) {
    recordModelFailure(providerId, model);
  }
}
