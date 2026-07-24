/**
 * JARVIS Button Component
 *
 * Variants follow the Design DNA:
 * - ghost: Transparent with hover glow
 * - primary: Cyan neon glow effect
 * - danger: Red destructive action
 * - outline: Thin glowing border
 * - accent: Purple accent glow
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium whitespace-nowrap",
    "transition-all duration-250",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jarvis-primary focus-visible:ring-offset-2 focus-visible:ring-offset-jarvis-bg-deepest",
    "disabled:pointer-events-none disabled:opacity-40",
    "cursor-pointer",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-jarvis-primary/15 text-jarvis-primary",
          "border border-jarvis-primary/30",
          "hover:bg-jarvis-primary/25 hover:border-jarvis-primary/50",
          "hover:shadow-[0_0_20px_rgba(52,245,208,0.25)]",
          "active:bg-jarvis-primary/30",
        ].join(" "),
        ghost: [
          "bg-transparent text-jarvis-text-secondary",
          "hover:bg-jarvis-primary/8 hover:text-jarvis-text",
          "active:bg-jarvis-primary/12",
        ].join(" "),
        danger: [
          "bg-jarvis-danger/15 text-jarvis-danger",
          "border border-jarvis-danger/30",
          "hover:bg-jarvis-danger/25 hover:border-jarvis-danger/50",
          "hover:shadow-[0_0_20px_rgba(255,94,125,0.25)]",
          "active:bg-jarvis-danger/30",
        ].join(" "),
        outline: [
          "bg-transparent text-jarvis-text-secondary",
          "border border-jarvis-border-strong",
          "hover:border-jarvis-primary/50 hover:text-jarvis-primary",
          "hover:shadow-[0_0_15px_rgba(52,245,208,0.12)]",
          "active:bg-jarvis-primary/5",
        ].join(" "),
        accent: [
          "bg-jarvis-accent/15 text-jarvis-accent",
          "border border-jarvis-accent/30",
          "hover:bg-jarvis-accent/25 hover:border-jarvis-accent/50",
          "hover:shadow-[0_0_20px_rgba(138,92,255,0.25)]",
          "active:bg-jarvis-accent/30",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-[8px] [&_svg]:size-3.5",
        md: "h-10 px-4 text-sm rounded-[12px] [&_svg]:size-4",
        lg: "h-12 px-6 text-base rounded-[14px] [&_svg]:size-5",
        icon: "size-10 rounded-[12px] [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
