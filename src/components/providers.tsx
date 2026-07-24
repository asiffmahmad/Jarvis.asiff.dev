"use client";

/**
 * JARVIS Providers
 *
 * Client-side providers wrapper. Extracted from the root layout
 * so that the layout.tsx can remain a Server Component while
 * client-only providers (ThemeProvider, TooltipProvider) are
 * properly wrapped in a "use client" boundary.
 */

import { type ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/lib/auth";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
