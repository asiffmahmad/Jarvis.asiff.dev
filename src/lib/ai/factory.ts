import { type AIProvider } from "./provider";
import { GroqProvider } from "./groq";
import { OpenRouterProvider } from "./openrouter";
import { getModelForTask, recordModelFailure } from "./model-router";
import type { TaskType } from "./model-router";
import { serverEnv } from "../env";
import { generateText as baseGenerateText } from "ai";

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

  static async generateText(options: {
    task?: TaskType;
    system?: string;
    prompt: string;
    temperature?: number;
  }) {
    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const available = getAvailableProviders();
      let entry;
      try {
        entry = getModelForTask(options.task || "balanced", available);
      } catch (err) {
        throw new Error("No AI model available. Please configure GROQ_API_KEY or OPENROUTER_API_KEY.");
      }

      try {
        const provider = this.getProvider(entry.provider as SupportedProviders);
        const model = provider.getModel({ model: entry.model });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const result = await baseGenerateText({
          model,
          messages: [
            ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
            { role: "user" as const, content: options.prompt }
          ],
          temperature: options.temperature ?? 0.7,
          abortSignal: controller.signal,
        });

        clearTimeout(timeoutId);
        return result;
      } catch (err) {
        console.warn(`[AI FACTORY] Attempt ${attempt + 1} failed for ${entry.provider}:${entry.model}:`, err);
        this.reportFailure(entry.provider, entry.model);
        lastError = err;
      }
    }
    throw lastError || new Error("All model generation attempts failed.");
  }
}
