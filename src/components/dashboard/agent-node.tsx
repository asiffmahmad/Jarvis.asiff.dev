"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AgentNodeProps {
  id: string;
  name: string;
  value?: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  isSelected: boolean;
  onClick: () => void;
}

export function AgentNode({ id, name, value, x, y, scale, opacity, isSelected, onClick }: AgentNodeProps) {
  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex: y > 0 ? 30 : 10,
      }}
      onClick={onClick}
    >
      <div className="relative flex flex-col items-center">
        <div className={cn(
          "w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300",
          isSelected
            ? "border-jarvis-primary bg-jarvis-primary/15 shadow-[0_0_25px_rgba(52,245,208,0.3)]"
            : "border-jarvis-panel-border bg-jarvis-panel/50 hover:bg-jarvis-panel hover:border-jarvis-primary/50"
        )}>
          {value && (
            <span className={cn(
              "text-sm font-bold font-mono",
              isSelected ? "text-jarvis-primary" : "text-jarvis-text"
            )}>
              {value}
            </span>
          )}
        </div>

        <div className="absolute top-[72px] w-max text-center pointer-events-none">
          <div className={cn(
            "text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
            isSelected ? "text-jarvis-primary" : "text-jarvis-text-muted group-hover:text-jarvis-text"
          )}>
            {name}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
