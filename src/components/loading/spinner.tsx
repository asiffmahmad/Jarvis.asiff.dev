/**
 * JARVIS Spinner
 *
 * Branded loading spinner with neon glow effect.
 */

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "size-4 border-[1.5px]",
  md: "size-6 border-2",
  lg: "size-10 border-[3px]",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        "border-jarvis-panel border-t-jarvis-primary",
        "drop-shadow-[0_0_4px_rgba(52,245,208,0.4)]",
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}
