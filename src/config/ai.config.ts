export const AI_CONFIG = {
  providers: {
    openai: "OpenAI",
    anthropic: "Anthropic",
    groq: "Groq",
  },
  models: {
    defaultText: "gpt-4-turbo",
    defaultFast: "llama3-70b-8192", // Groq
    defaultVision: "claude-3-opus",
  },
  limits: {
    maxTokens: 4096,
    defaultTemperature: 0.7,
    maxHistoryContext: 10,
  },
  timeouts: {
    standardRequestMs: 30000,
    longRequestMs: 120000,
  }
} as const;
