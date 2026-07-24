/**
 * JARVIS Content Automation Suite — API Client
 *
 * Type-safe fetch wrapper for internal and external API calls.
 * Provides consistent error handling, timeouts, and retry logic.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("APIClient");

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface RequestConfig extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
  retries?: number;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 0;
const RETRY_DELAY_MS = 1_000;

/* ------------------------------------------------------------------ */
/*  Implementation                                                     */
/* ------------------------------------------------------------------ */

async function request<T>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    body,
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    headers: customHeaders,
    ...fetchOptions
  } = config;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;
  const attempts = retries + 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      log.debug("API request", { url, method: fetchOptions.method ?? "GET", attempt });

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error");
        let parsedMessage = errorBody;
        try {
          const json = JSON.parse(errorBody);
          if (json.message) parsedMessage = json.message;
        } catch {}

        const apiError = new ApiError(parsedMessage, response.status);
        log.error("API error response", {
          url,
          status: response.status,
          body: errorBody,
        });
        throw apiError;
      }

      const data = (await response.json()) as T;
      return { data, status: response.status, ok: true };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < attempts) {
        log.warn("Retrying request", {
          url,
          attempt,
          maxAttempts: attempts,
        });
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempt)
        );
      }
    }
  }

  clearTimeout(timeoutId);
  log.error("API request failed after all retries", { url, error: lastError?.message });
  throw lastError;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export const apiClient = {
  get: <T>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "GET" }),

  post: <T>(url: string, body?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "POST", body }),

  put: <T>(url: string, body?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "PUT", body }),

  patch: <T>(url: string, body?: unknown, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "PATCH", body }),

  delete: <T>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: "DELETE" }),
} as const;
