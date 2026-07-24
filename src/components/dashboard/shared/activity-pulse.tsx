"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActivityPulseProps {
  status: "active" | "idle" | "error";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-3",
};

const colorMap = {
  active: "bg-jarvis-success shadow-[0_0_8px_rgba(66,255,152,0.8)]",
  idle: "bg-jarvis-warning shadow-[0_0_8px_rgba(248,227,107,0.8)]",
  error: "bg-jarvis-danger shadow-[0_0_8px_rgba(255,94,125,0.8)]",
};

export function ActivityPulse({ status, className, size = "sm" }: ActivityPulseProps) {
  return (
    <div className={cn("relative flex items-center justify-center", sizeMap[size], className)}>
      {status === "active" && (
        <motion.div
          animate={{
            scale: [1, 2.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn("absolute inset-0 rounded-full", colorMap[status])}
        />
      )}
      <div className={cn("relative rounded-full", sizeMap[size], colorMap[status])} />
    </div>
  );
}
