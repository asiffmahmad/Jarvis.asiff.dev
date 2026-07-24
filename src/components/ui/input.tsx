/**
 * JARVIS Input Component
 *
 * Glass background inputs with floating label support.
 * DNA spec: glass background, thin glowing borders, focus glow.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[12px] px-4 py-2",
        "bg-jarvis-panel/60 backdrop-blur-sm",
        "border border-jarvis-border",
        "text-sm text-jarvis-text placeholder:text-jarvis-text-muted",
        "transition-all duration-250",
        "focus:outline-none focus:border-jarvis-primary/50",
        "focus:shadow-[0_0_15px_rgba(52,245,208,0.12)]",
        "focus:bg-jarvis-panel/80",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-jarvis-text",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
