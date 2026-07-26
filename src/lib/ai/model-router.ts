export type TaskType = "fast" | "balanced" | "powerful";

interface ModelEntry {
  model: string;
  provider: string;
}

const MODEL_TIERS: Record<TaskType, ModelEntry[]> = {
  fast: [
    { model: "deepseek/deepseek-chat", provider: "openrouter" },
    { model: "google/gemini-2.0-flash-lite-preview-02-05:free", provider: "openrouter" },
  ],
  balanced: [
    { model: "meta-llama/llama-3.1-8b-instruct:free", provider: "openrouter" },
    { model: "google/gemma-4-31b-it", provider: "nvidia" },
    { model: "google/gemini-2.0-flash-lite-preview-02-05:free", provider: "openrouter" },
    { model: "llama-3.3-70b-versatile", provider: "groq" },
  ],
  powerful: [
    { model: "google/gemma-4-31b-it", provider: "nvidia" },
    { model: "openai/gpt-4o", provider: "openrouter" },
    { model: "meta-llama/llama-3.1-405b", provider: "openrouter" },
    { model: "claude-3.5-sonnet", provider: "openrouter" },
  ],
};

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export function getModelForTask(
  task: TaskType = "balanced",
  availableProviders?: Set<string>,
): ModelEntry {
  const tiers = task === "fast" ? ["fast", "balanced", "powerful"]
    : task === "powerful" ? ["powerful", "balanced"]
    : ["balanced", "fast", "powerful"];

  for (const tier of tiers) {
    const models = MODEL_TIERS[tier as TaskType] || [];
    for (const entry of models) {
      if (availableProviders && !availableProviders.has(entry.provider)) continue;
      const key = `${entry.provider}:${entry.model}`;
      const cooldownUntil = cooldowns.get(key);
      if (cooldownUntil && Date.now() < cooldownUntil) continue;
      return entry;
    }
  }

  // Fallback to first available provider's model
  for (const entry of MODEL_TIERS.balanced) {
    if (availableProviders && !availableProviders.has(entry.provider)) continue;
    return entry;
  }

  throw new Error("No AI model available. Please configure at least one AI provider (GROQ_API_KEY or OPENROUTER_API_KEY).");
}

export function recordModelFailure(provider: string, model: string) {
  const key = `${provider}:${model}`;
  cooldowns.set(key, Date.now() + COOLDOWN_MS);
}
