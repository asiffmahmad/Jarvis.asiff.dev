"use client";

import { motion } from "framer-motion";
import { Bot, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAgentStatus } from "@/lib/events/use-events";
import { cn } from "@/lib/utils";

interface AgentNodeProps {
  id: string;
  name: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  isSelected: boolean;
  onClick: () => void;
}

export function AgentNode({ id, name, x, y, scale, opacity, isSelected, onClick }: AgentNodeProps) {
  const { status, currentTask } = useAgentStatus(id);

  let icon = <Bot className="size-4" />;
  let ringColor = "border-jarvis-panel-border";
  let glow = "shadow-none";
  let animation = {};

  if (isSelected) {
    ringColor = "border-white";
    glow = "shadow-[0_0_20px_rgba(255,255,255,0.3)]";
  } else if (status === 'executing' || status === 'thinking') {
    icon = <Loader2 className="size-4 animate-spin text-[#34F5D0]" />;
    ringColor = "border-[#34F5D0]";
    glow = "shadow-[0_0_20px_rgba(52,245,208,0.4)]";
    animation = { y: [0, -10, 0] };
  } else if (status === 'failed') {
    icon = <AlertTriangle className="size-4 text-[#FF4D4D]" />;
    ringColor = "border-[#FF4D4D]";
    glow = "shadow-[0_0_20px_rgba(255,77,77,0.4)]";
  } else if (status === 'completed') {
    icon = <CheckCircle2 className="size-4 text-[#34F5D0]" />;
    ringColor = "border-[#34F5D0]";
  }

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
      animate={status === 'executing' || status === 'thinking' ? animation : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      onClick={onClick}
    >
      <div className="relative flex flex-col items-center">
        
        {/* Node Orb */}
        <div className={cn(
          "w-12 h-12 rounded-full glass-strong border-2 flex items-center justify-center transition-all duration-300",
          ringColor, glow,
          isSelected ? "bg-jarvis-primary/20" : "bg-jarvis-panel/50 hover:bg-jarvis-panel"
        )}>
          {icon}
        </div>

        {/* Node Label */}
        <div className="absolute top-14 w-max text-center pointer-events-none">
          <div className={cn(
            "text-[10px] font-bold uppercase tracking-widest transition-colors",
            isSelected || status === 'executing' ? "text-jarvis-text text-glow" : "text-jarvis-text-muted group-hover:text-jarvis-text"
          )}>
            {name}
          </div>
          {currentTask && (
            <div className="text-[8px] text-[#34F5D0] mt-1 max-w-[100px] truncate opacity-80">
              {currentTask}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
