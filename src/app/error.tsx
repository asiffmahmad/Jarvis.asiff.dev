"use client";

/**
 * JARVIS Route-Level Error UI
 *
 * Shown when a route segment throws an unhandled error.
 * Provides retry and navigation recovery options.
 */

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLogger } from "@/lib/logger";

const log = createLogger("RouteError");

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error("Route error", {
      message: error.message,
      digest: error.digest ?? "none",
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-jarvis-bg-deepest p-8">
      <div className="max-w-md w-full text-center glass-panel p-10">
        {/* Icon */}
        <div className="mx-auto mb-6 size-20 rounded-full bg-jarvis-danger/10 border border-jarvis-danger/25 flex items-center justify-center">
          <AlertTriangle className="size-10 text-jarvis-danger" />
        </div>

        {/* Title */}
        <h2 className="font-heading text-xl font-bold tracking-wider uppercase text-jarvis-text mb-2">
          System Malfunction
        </h2>

        <p className="text-sm text-jarvis-text-muted mb-6">
          An unexpected error has disrupted this module. The issue has been logged for analysis.
        </p>

        {/* Error details */}
        <div className="mb-8 rounded-[10px] bg-jarvis-bg-deepest p-4 border border-jarvis-danger/15">
          <code className="text-xs text-jarvis-danger/70 break-all leading-relaxed">
            {error.message}
          </code>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" onClick={reset}>
            <RotateCcw className="size-4" />
            Retry Module
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            <Home className="size-4" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
