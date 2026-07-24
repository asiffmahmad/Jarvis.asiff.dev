"use client";

import { motion } from "framer-motion";
import { Plus, Play, RefreshCw, XCircle, Copy, Trash2 } from "lucide-react";
import type { SchedulerState } from "@/lib/scheduler/use-scheduler";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  state: SchedulerState;
}

export function SchedulerToolbar({ state }: ToolbarProps) {
  const { activeJob, createJob, cancelJob, retryJob, runNow } = state;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-jarvis-panel border border-jarvis-panel-border shadow-[0_0_40px_rgba(52,245,208,0.1)] rounded-full px-4 py-2 flex items-center gap-2 z-50 glass-strong"
    >
      <button 
        onClick={createJob}
        className="flex items-center gap-2 px-4 py-2 bg-jarvis-primary/10 hover:bg-jarvis-primary text-jarvis-primary hover:text-jarvis-bg-deepest rounded-full transition-all text-xs font-bold uppercase tracking-wider border border-jarvis-primary/30"
      >
        <Plus className="size-3" /> New Schedule
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />

      {activeJob ? (
        <>
          <ToolButton 
            icon={Play} 
            label="Run Now" 
            onClick={() => runNow(activeJob.id)} 
            disabled={["RUNNING", "SUCCESS", "CANCELLED"].includes(activeJob.status)} 
          />
          <ToolButton 
            icon={RefreshCw} 
            label="Retry" 
            onClick={() => retryJob(activeJob.id)} 
            disabled={!["FAILED", "CANCELLED"].includes(activeJob.status)} 
          />
          <ToolButton 
            icon={XCircle} 
            label="Cancel" 
            onClick={() => cancelJob(activeJob.id)} 
            disabled={["SUCCESS", "FAILED", "CANCELLED"].includes(activeJob.status)}
            danger
          />
          <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />
          <ToolButton icon={Copy} label="Duplicate" disabled />
          <ToolButton icon={Trash2} label="Delete" disabled danger />
        </>
      ) : (
        <div className="px-4 text-xs font-mono text-jarvis-text-muted uppercase tracking-widest">
          Select a job to view actions
        </div>
      )}
    </motion.div>
  );
}

function ToolButton({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled, 
  danger 
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick?: () => void; 
  disabled?: boolean; 
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors text-xs font-bold uppercase tracking-widest border border-transparent",
        disabled
          ? "opacity-30 cursor-not-allowed text-jarvis-text-muted"
          : danger
            ? "hover:bg-red-500/10 hover:border-red-500/30 text-red-500"
            : "hover:bg-jarvis-panel/50 hover:border-jarvis-panel-border text-jarvis-text"
      )}
    >
      <Icon className="size-3" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
