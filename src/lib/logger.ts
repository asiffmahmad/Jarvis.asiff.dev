/**
 * JARVIS Content Automation Suite — Structured Logger
 *
 * Environment-aware logging system with structured context.
 * Verbose output in development, minimal in production.
 * All log entries include a module tag for easy filtering.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  if (typeof window !== "undefined") {
    return "warn";
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[getMinLevel()];
}

function formatEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    `[${entry.module}]`,
    entry.message,
  ];
  return parts.join(" ");
}

function emit(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;

  const formatted = formatEntry(entry);

  switch (entry.level) {
    case "debug":
      console.debug(formatted, entry.data ?? "");
      break;
    case "info":
      console.info(formatted, entry.data ?? "");
      break;
    case "warn":
      console.warn(formatted, entry.data ?? "");
      break;
    case "error":
      console.error(formatted, entry.data ?? "");
      break;
  }
}

/**
 * Create a scoped logger instance bound to a module name.
 *
 * @example
 * const log = createLogger("Sidebar");
 * log.info("Navigation collapsed");
 * log.error("Failed to load items", { error: err.message });
 */
export function createLogger(module: string) {
  function log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ): void {
    emit({
      level,
      module,
      message,
      timestamp: new Date().toISOString(),
      data,
    });
  }

  return {
    debug: (message: string, data?: Record<string, unknown>) =>
      log("debug", message, data),
    info: (message: string, data?: Record<string, unknown>) =>
      log("info", message, data),
    warn: (message: string, data?: Record<string, unknown>) =>
      log("warn", message, data),
    error: (message: string, data?: Record<string, unknown>) =>
      log("error", message, data),
  };
}

/** Global logger instance for one-off usage. */
export const logger = createLogger("JARVIS");
