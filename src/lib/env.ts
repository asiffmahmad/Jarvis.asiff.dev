/**
 * JARVIS Content Automation Suite — Environment Configuration
 *
 * Type-safe access to environment variables with runtime validation.
 * Centralizes all environment variable reads so missing values are
 * caught at startup rather than at arbitrary call sites.
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[JARVIS] Missing required environment variable: ${key}. ` +
        "Check your .env.local file against .env.example."
    );
  }
  return value;
}

function optional(key: string, fallback: string = ""): string {
  return process.env[key] ?? fallback;
}

function bool(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

/** Server-only environment variables. Never prefix with NEXT_PUBLIC_. */
export const serverEnv = {
  get nodeEnv() {
    return optional("NODE_ENV", "development");
  },
  get isProduction() {
    return this.nodeEnv === "production";
  },
  get isDevelopment() {
    return this.nodeEnv === "development";
  },

  /* Database */
  get databaseUrl() {
    return optional("DATABASE_URL");
  },
  get databaseDirectUrl() {
    return optional("DATABASE_DIRECT_URL");
  },

  /* Authentication */
  get authSecret() {
    return optional("AUTH_SECRET");
  },
  get authUrl() {
    return optional("AUTH_URL", "http://localhost:3000");
  },
  get adminUsername() {
    return optional("ADMIN_USERNAME", "admin");
  },
  get adminPassword() {
    return optional("ADMIN_PASSWORD", "admin");
  },

  /* AI Providers */
  get openaiApiKey() {
    return optional("OPENAI_API_KEY");
  },
  get anthropicApiKey() {
    return optional("ANTHROPIC_API_KEY");
  },
  get googleAiApiKey() {
    return optional("GOOGLE_AI_API_KEY");
  },
  get groqApiKey() {
    return optional("GROQ_API_KEY");
  },

  /* Social Media */
  get instagramAccessToken() {
    return optional("INSTAGRAM_ACCESS_TOKEN");
  },
  get linkedinAccessToken() {
    return optional("LINKEDIN_ACCESS_TOKEN");
  },
  get threadsAccessToken() {
    return optional("THREADS_ACCESS_TOKEN");
  },
  get xApiKey() {
    return optional("X_API_KEY");
  },
  get xApiSecret() {
    return optional("X_API_SECRET");
  },
  get youtubeApiKey() {
    return optional("YOUTUBE_API_KEY");
  },

  /* Storage */
  get storageBucket() {
    return optional("STORAGE_BUCKET");
  },
  get storageRegion() {
    return optional("STORAGE_REGION");
  },
  get storageAccessKey() {
    return optional("STORAGE_ACCESS_KEY");
  },
  get storageSecretKey() {
    return optional("STORAGE_SECRET_KEY");
  },
} as const;

/** Client-safe environment variables. All must use NEXT_PUBLIC_ prefix. */
export const clientEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "JARVIS",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  enableAiAssistant: bool("NEXT_PUBLIC_ENABLE_AI_ASSISTANT", true),
  enableAnalytics: bool("NEXT_PUBLIC_ENABLE_ANALYTICS", true),
  enableAutomation: bool("NEXT_PUBLIC_ENABLE_AUTOMATION", true),
} as const;

export { required, optional, bool };
