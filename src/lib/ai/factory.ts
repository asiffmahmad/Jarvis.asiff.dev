import { type AIProvider } from "./provider";
import { GroqProvider } from "./groq";
import { OpenRouterProvider } from "./openrouter";
import { NvidiaProvider } from "./nvidia";
import { getModelForTask, recordModelFailure } from "./model-router";
import type { TaskType } from "./model-router";
import { serverEnv } from "../env";
import { generateText as baseGenerateText } from "ai";

export type SupportedProviders = "groq" | "openai" | "claude" | "gemini" | "openrouter" | "nvidia";

function getAvailableProviders(): Set<string> {
  const available = new Set<string>();
  if (serverEnv.groqApiKey) available.add("groq");
  if (serverEnv.openrouterApiKey) available.add("openrouter");
  if (serverEnv.nvidiaApiKey) available.add("nvidia");
  return available;
}

export class AIProviderFactory {
  private static providers = new Map<string, AIProvider>([
    ["groq", new GroqProvider()],
    ["openrouter", new OpenRouterProvider()],
    ["nvidia", new NvidiaProvider()],
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
    prompt: string | any[];
    temperature?: number;
  }) {
    const errors: string[] = [];
    for (let attempt = 0; attempt < 4; attempt++) {
      const available = getAvailableProviders();
      let entry;
      try {
        entry = getModelForTask(options.task || "balanced", available);
      } catch (err) {
        if (errors.length > 0) {
          throw new Error(`All models failed.\n\nError Log:\n${errors.join("\n")}`);
        }
        throw new Error("No AI model available. Please configure GROQ_API_KEY, OPENROUTER_API_KEY, or NVIDIA_API_KEY.");
      }

      try {
        const provider = this.getProvider(entry.provider as SupportedProviders);
        const model = provider.getModel({ model: entry.model });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const messages = Array.isArray(options.prompt) 
          ? [...(options.system ? [{ role: "system" as const, content: options.system }] : []), ...options.prompt]
          : [...(options.system ? [{ role: "system" as const, content: options.system }] : []), { role: "user" as const, content: options.prompt }];

        const result = await baseGenerateText({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          maxTokens: 2048,
          abortSignal: controller.signal,
        });

        clearTimeout(timeoutId);
        return result;
      } catch (err: any) {
        console.warn(`[AI FACTORY] Attempt ${attempt + 1} failed for ${entry.provider}:${entry.model}:`, err.message);
        errors.push(`- ${entry.provider} (${entry.model}): ${err.message}`);
        this.reportFailure(entry.provider, entry.model);
      }
    }
    
    throw new Error(`All 4 model generation attempts failed.\n\nError Log:\n${errors.join("\n")}`);
  }

  static async streamText(options: {
    task?: TaskType;
    system?: string;
    prompt: string | any[];
    temperature?: number;
  }) {
    const errors: string[] = [];
    
    const { streamText: baseStreamText } = await import("ai");

    for (let attempt = 0; attempt < 4; attempt++) {
      const available = getAvailableProviders();
      let entry;
      
      try {
        entry = getModelForTask(options.task || "balanced", available);
      } catch (err) {
        if (errors.length > 0) {
          throw new Error(`All models failed.\n\nError Log:\n${errors.join("\n")}`);
        }
        throw new Error("No AI model available. Please configure API keys.");
      }

      try {
        const provider = this.getProvider(entry.provider as SupportedProviders);
        const model = provider.getModel({ model: entry.model });

        const messages = Array.isArray(options.prompt) 
          ? [...(options.system ? [{ role: "system" as const, content: options.system }] : []), ...options.prompt]
          : [...(options.system ? [{ role: "system" as const, content: options.system }] : []), { role: "user" as const, content: options.prompt }];

        const result = await baseStreamText({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          maxTokens: 2048,
        });

        return result;
      } catch (err: any) {
        console.warn(`[AI FACTORY] Attempt ${attempt + 1} stream failed for ${entry.provider}:${entry.model}:`, err.message);
        errors.push(`- ${entry.provider} (${entry.model}): ${err.message}`);
        this.reportFailure(entry.provider, entry.model);
      }
    }
    
    throw new Error(`All 4 model stream attempts failed.\n\nError Log:\n${errors.join("\n")}`);
  }
}
