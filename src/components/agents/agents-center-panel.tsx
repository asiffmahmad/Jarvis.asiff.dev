"use client";

import { motion } from "framer-motion";
import { Cpu, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { AgentsState } from "@/lib/agents/use-agents";
import { cn } from "@/lib/utils";

interface CenterPanelProps {
  state: AgentsState;
}

export function AgentsCenterPanel({ state }: CenterPanelProps) {
  const { activeAgent, executionState } = state;

  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50 p-8">
      
      <div className="flex flex-col items-center justify-center flex-1">
        
        {!activeAgent ? (
          <div className="text-center text-jarvis-text-muted opacity-50 flex flex-col items-center">
            <Cpu className="size-16 mb-4" />
            <h2 className="text-lg font-heading tracking-widest uppercase">No Agent Selected</h2>
          </div>
        ) : (
          <motion.div 
            key={activeAgent.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg flex flex-col items-center"
          >
            {/* Holographic Agent Card */}
            <div className={cn(
              "w-64 h-64 rounded-full border border-jarvis-panel/50 glass-strong flex flex-col items-center justify-center relative transition-all duration-500",
              executionState.status === 'running' && "border-[#F5A623] shadow-[0_0_60px_rgba(245,166,35,0.2)] animate-pulse",
              executionState.status === 'success' && "border-[#34F5D0] shadow-[0_0_60px_rgba(52,245,208,0.2)]",
              executionState.status === 'error' && "border-[#FF4D4D] shadow-[0_0_60px_rgba(255,77,77,0.2)]"
            )}>
              {/* Core visual */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-jarvis-primary/5 to-transparent mix-blend-screen" />
              
              {executionState.status === 'running' ? (
                <Loader2 className="size-24 text-[#F5A623] animate-spin" />
              ) : executionState.status === 'success' ? (
                <CheckCircle2 className="size-24 text-[#34F5D0]" />
              ) : executionState.status === 'error' ? (
                <AlertCircle className="size-24 text-[#FF4D4D]" />
              ) : (
                <Cpu className="size-24 text-jarvis-text-muted opacity-50" />
              )}
            </div>

            <div className="mt-8 text-center">
              <h2 className="text-3xl font-heading font-bold uppercase tracking-widest text-glow text-jarvis-text">
                {activeAgent.name}
              </h2>
              <div className="mt-2 inline-flex items-center justify-center bg-jarvis-panel px-3 py-1 rounded-full border border-jarvis-panel-border">
                <span className={cn(
                  "text-[10px] font-mono uppercase tracking-widest flex items-center gap-2",
                  executionState.status === 'running' ? "text-[#F5A623]" :
                  executionState.status === 'success' ? "text-[#34F5D0]" :
                  executionState.status === 'error' ? "text-[#FF4D4D]" :
                  "text-jarvis-text-muted"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    executionState.status === 'running' ? "bg-[#F5A623] animate-pulse" :
                    executionState.status === 'success' ? "bg-[#34F5D0]" :
                    executionState.status === 'error' ? "bg-[#FF4D4D]" :
                    "bg-jarvis-text-muted"
                  )} />
                  Status: {executionState.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Execution Progress Bar */}
            <div className="w-full mt-12 bg-jarvis-panel/30 h-2 rounded-full overflow-hidden border border-jarvis-panel-border/50">
              <motion.div 
                className={cn(
                  "h-full",
                  executionState.status === 'running' ? "bg-[#F5A623]" :
                  executionState.status === 'success' ? "bg-[#34F5D0]" :
                  executionState.status === 'error' ? "bg-[#FF4D4D]" :
                  "bg-transparent"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${executionState.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Status Message */}
            {executionState.logs.length > 0 && (
              <p className="mt-4 text-xs font-mono text-jarvis-text-muted uppercase tracking-widest h-4">
                {executionState.logs[executionState.logs.length - 1].message}
              </p>
            )}

          </motion.div>
        )}
      </div>
    </div>
  );
}
