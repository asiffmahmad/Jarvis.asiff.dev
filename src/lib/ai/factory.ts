import { type AIProvider } from "./provider";
import { GroqProvider } from "./groq";

export type SupportedProviders = "groq" | "openai" | "claude" | "gemini";

/**
 * JARVIS AI Provider Factory
 *
 * This factory abstracts the selection and instantiation of AI providers.
 * Currently, only Groq is fully implemented, but this pattern allows
 * adding OpenAI, Claude, etc., without changing the consuming API routes.
 */
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map([
    ["groq", new GroqProvider()],
    // Future providers will be registered here
    // ["openai", new OpenAIProvider()],
  ]);

  /**
   * Retrieves the requested AI provider instance.
   * @param providerId The ID of the provider (defaults to "groq")
   */
  static getProvider(providerId: SupportedProviders = "groq"): AIProvider {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error(`AI Provider '${providerId}' is not implemented or registered.`);
    }

    return provider;
  }
}
