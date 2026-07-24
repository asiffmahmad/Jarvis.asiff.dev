/**
 * JARVIS Badge Component
 *
 * Status badges with glow effects matching the JARVIS design language.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center",
    "rounded-full px-2.5 py-0.5",
    "text-xs font-medium",
    "transition-colors duration-200",
    "border",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-jarvis-primary/10 text-jarvis-primary",
          "border-jarvis-primary/20",
        ].join(" "),
        secondary: [
          "bg-jarvis-secondary/10 text-jarvis-secondary",
          "border-jarvis-secondary/20",
        ].join(" "),
        accent: [
          "bg-jarvis-accent/10 text-jarvis-accent",
          "border-jarvis-accent/20",
        ].join(" "),
        success: [
          "bg-jarvis-success/10 text-jarvis-success",
          "border-jarvis-success/20",
        ].join(" "),
        warning: [
          "bg-jarvis-warning/10 text-jarvis-warning",
          "border-jarvis-warning/20",
        ].join(" "),
        danger: [
          "bg-jarvis-danger/10 text-jarvis-danger",
          "border-jarvis-danger/20",
        ].join(" "),
        muted: [
          "bg-jarvis-text-muted/10 text-jarvis-text-muted",
          "border-jarvis-text-muted/20",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
