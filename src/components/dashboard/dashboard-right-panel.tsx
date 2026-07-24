"use client";

import { motion } from "framer-motion";
import { Info, Database, Zap } from "lucide-react";
import { useAgentStatus } from "@/lib/events/use-events";

interface RightPanelProps {
  selectedAgent: string | null;
}

export function DashboardRightPanel({ selectedAgent }: RightPanelProps) {
  // We use the hook even if selectedAgent is null, it just won't update much.
  const { status, currentTask } = useAgentStatus(selectedAgent || 'none');

  if (!selectedAgent) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[300px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20 p-6 items-center justify-center text-center"
      >
        <Info className="size-8 text-jarvis-panel-border mb-4" />
        <p className="text-xs text-jarvis-text-muted">Select an Agent Node in the AI Core to inspect its live status and memory bounds.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[300px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
          <Info className="size-4 text-jarvis-primary" /> Inspector
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <section>
          <h3 className="text-sm font-bold text-jarvis-text mb-1 uppercase tracking-widest capitalize">
            {selectedAgent.replace('agent-', '')} Agent
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-jarvis-panel-border' : status === 'executing' || status === 'thinking' ? 'bg-[#34F5D0] animate-pulse' : status === 'failed' ? 'bg-[#FF4D4D]' : 'bg-[#34F5D0]'}`} />
            <span className="text-xs text-jarvis-text-muted uppercase tracking-wider">{status}</span>
          </div>
        </section>

        {currentTask && (
          <section className="p-3 border border-jarvis-primary/30 bg-jarvis-primary/5 rounded-lg">
            <h4 className="text-[9px] uppercase tracking-widest text-jarvis-primary mb-1 font-bold">Current Execution</h4>
            <p className="text-xs text-jarvis-text font-mono leading-relaxed">{currentTask}</p>
          </section>
        )}

        <section>
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Database className="size-3" /> Shared Memory
          </h3>
          <div className="space-y-2 text-xs font-mono text-jarvis-text-muted">
            <div className="flex justify-between border-b border-jarvis-panel-border/30 pb-1">
              <span>Read Bound:</span>
              <span className="text-jarvis-text">Yes</span>
            </div>
            <div className="flex justify-between border-b border-jarvis-panel-border/30 pb-1">
              <span>Write Bound:</span>
              <span className="text-jarvis-text">Yes</span>
            </div>
            <div className="flex justify-between pb-1">
              <span>Context Window:</span>
              <span className="text-jarvis-text">128k</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap className="size-3" /> Tool Registry
          </h3>
          <div className="flex flex-wrap gap-2">
            {['read_db', 'write_db', 'search_web', 'execute_code'].map(tool => (
              <span key={tool} className="px-2 py-1 bg-jarvis-panel border border-jarvis-panel-border rounded text-[9px] font-mono text-jarvis-text">
                {tool}
              </span>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  );
}
