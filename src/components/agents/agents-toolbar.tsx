"use client";

import { motion } from "framer-motion";
import { Play, Square, Settings, Download } from "lucide-react";
import type { AgentsState } from "@/lib/agents/use-agents";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  state: AgentsState;
}

export function AgentsToolbar({ state }: ToolbarProps) {
  const { activeAgent, executionState, executeAgent, stopExecution, resetExecution } = state;

  const isRunning = executionState.status === 'running';
  const hasFinished = executionState.status === 'success' || executionState.status === 'error';

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-jarvis-panel border border-jarvis-panel-border shadow-[0_0_40px_rgba(52,245,208,0.1)] rounded-full px-4 py-2 flex items-center gap-2 z-50 glass-strong"
    >
      <button 
        onClick={isRunning ? stopExecution : hasFinished ? resetExecution : executeAgent}
        disabled={!activeAgent}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider",
          !activeAgent ? "opacity-30 cursor-not-allowed bg-jarvis-panel border border-transparent text-jarvis-text" :
          isRunning
            ? "bg-[#FF4D4D] text-white hover:bg-[#FF4D4D]/80"
            : hasFinished
            ? "bg-jarvis-panel-border text-jarvis-text hover:bg-jarvis-panel"
            : "bg-[#34F5D0] hover:bg-[#34F5D0]/80 text-jarvis-bg-deepest"
        )}
      >
        {isRunning ? <Square className="size-3 fill-current" /> : <Play className="size-3 fill-current" />}
        {isRunning ? "Stop Agent" : hasFinished ? "Reset Context" : "Initialize Agent"}
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />
      
      <ToolButton icon={Settings} label="Configure" disabled={!activeAgent || isRunning} />
      <ToolButton icon={Download} label="Export Logs" disabled={executionState.logs.length === 0} />

    </motion.div>
  );
}

function ToolButton({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled, 
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick?: () => void; 
  disabled?: boolean; 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors text-xs font-bold uppercase tracking-widest border border-transparent",
        disabled
          ? "opacity-30 cursor-not-allowed text-jarvis-text-muted"
          : "hover:bg-jarvis-panel/50 hover:border-jarvis-panel-border text-jarvis-text"
      )}
    >
      <Icon className="size-3" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
