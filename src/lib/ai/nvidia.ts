import { type AIProvider, type AIProviderConfig } from "./provider";
import { serverEnv } from "../env";

interface NvidiaResponse {
  choices: {
    message: {
      content: string | null;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class NvidiaProvider implements AIProvider {
  readonly id = "nvidia";

  private defaultModel = "google/gemma-2-27b-it";

  getModel(config?: Partial<AIProviderConfig>) {
    const apiKey = config?.apiKey || serverEnv.nvidiaApiKey;
    const modelId = config?.model || this.defaultModel;

    if (!apiKey) {
      throw new Error("NVIDIA API key is missing. Please set NVIDIA_API_KEY in your environment.");
    }

    return {
      specificationVersion: "v1",
      provider: "nvidia",
      modelId,
      defaultObjectGenerationMode: "json",
      supportsImageUrls: false,
      supportsStructuredOutputs: false,

      doGenerate: async (options: {
        mode: { type: string };
        prompt: { role: string; content: string | { type: string; text: string }[] }[];
        abortSignal?: AbortSignal;
        headers?: Record<string, string>;
      }) => {
        const messages = options.prompt.map((msg) => {
          const text = typeof msg.content === "string"
            ? msg.content
            : msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
          return { role: msg.role, content: text };
        });

        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...options.headers,
          },
          body: JSON.stringify({
            model: modelId,
            messages,
            max_tokens: 1500, // Reduced to prevent limit errors
            temperature: 0.7,
            top_p: 0.95
          }),
          signal: options.abortSignal,
        });

        if (!res.ok) {
          const errorBody = await res.text().catch(() => "");
          throw new Error(`NVIDIA API error ${res.status}: ${errorBody}`);
        }

        const data: NvidiaResponse = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        const finishReason = data.choices?.[0]?.finish_reason || "stop";

        return {
          text: content,
          finishReason,
          usage: data.usage
            ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
              }
            : undefined,
          response: {
            id: `nvidia_${Date.now()}`,
            timestamp: new Date(),
            modelId,
          },
        };
      },

      doStream: async () => {
        throw new Error("Streaming not supported via NVIDIA provider");
      },
    };
  }
}
