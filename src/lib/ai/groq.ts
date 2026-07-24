import { createGroq } from "@ai-sdk/groq";
import { type AIProvider, type AIProviderConfig } from "./provider";
import { serverEnv } from "../env";

export class GroqProvider implements AIProvider {
  readonly id = "groq";

  private defaultModel = "llama-3.3-70b-versatile";

  getModel(config?: Partial<AIProviderConfig>) {
    const apiKey = config?.apiKey || serverEnv.groqApiKey;
    
    if (!apiKey) {
      throw new Error("Groq API key is missing. Please set GROQ_API_KEY in your environment.");
    }

    const groq = createGroq({
      apiKey,
    });

    return groq(config?.model || this.defaultModel);
  }
}
