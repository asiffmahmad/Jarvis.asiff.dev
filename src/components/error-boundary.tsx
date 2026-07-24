"use client";

/**
 * JARVIS Error Boundary
 *
 * React Error Boundary with JARVIS-styled fallback UI.
 * Catches rendering errors and provides recovery actions.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { createLogger } from "@/lib/logger";
import { Button } from "@/components/ui/button";

const log = createLogger("ErrorBoundary");

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error("Uncaught error in component tree", {
      error: error.message,
      stack: error.stack ?? "No stack trace",
      componentStack: errorInfo.componentStack ?? "No component stack",
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full text-center glass-panel p-8">
            <div className="mx-auto mb-6 size-16 rounded-full bg-jarvis-danger/10 border border-jarvis-danger/30 flex items-center justify-center">
              <AlertTriangle className="size-8 text-jarvis-danger" />
            </div>

            <h2 className="font-heading text-lg font-semibold tracking-wider uppercase text-jarvis-text mb-2">
              System Error
            </h2>

            <p className="text-sm text-jarvis-text-muted mb-2">
              A critical error has occurred in this module.
            </p>

            {this.state.error && (
              <div className="mb-6 rounded-[8px] bg-jarvis-bg-deepest p-3 border border-jarvis-danger/20">
                <code className="text-xs text-jarvis-danger/80 break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleRetry}
              >
                <RotateCcw className="size-3.5" />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleGoHome}
              >
                <Home className="size-3.5" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
