"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
  action?: ReactNode;
  glowColor?: "primary" | "secondary" | "accent" | "success" | "danger" | "warning";
}

const glowMap = {
  primary: "bg-jarvis-primary/10",
  secondary: "bg-jarvis-secondary/10",
  accent: "bg-jarvis-accent/10",
  success: "bg-jarvis-success/10",
  danger: "bg-jarvis-danger/10",
  warning: "bg-jarvis-warning/10",
};

export function DashboardCard({
  title,
  icon,
  children,
  isLoading,
  className,
  action,
  glowColor,
}: DashboardCardProps) {
  return (
    <Card className={cn("relative overflow-hidden group transition-all duration-300 hover:border-jarvis-border-strong", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
        <div className="flex items-center gap-2">
          {icon && <div className="text-jarvis-text-muted">{icon}</div>}
          <CardTitle className="text-xs text-jarvis-text-muted font-body font-normal tracking-wider uppercase">
            {title}
          </CardTitle>
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      
      <CardContent className="relative z-10 h-full pb-4">
        {isLoading ? (
          <div className="space-y-3 mt-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>

      {/* Subtle corner glow based on color prop */}
      {glowColor && (
        <motion.div 
          className={cn(
            "absolute -bottom-8 -right-8 size-32 rounded-full blur-[50px] opacity-20",
            "transition-opacity duration-500 group-hover:opacity-40",
            glowMap[glowColor]
          )}
        />
      )}
    </Card>
  );
}
