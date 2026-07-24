"use client";

import { Terminal, Calendar, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SchedulerState } from "@/lib/scheduler/use-scheduler";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  state: SchedulerState;
}

export function SchedulerRightPanel({ state }: RightPanelProps) {
  const { activeJob } = state;

  if (!activeJob) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-jarvis-bg-deepest text-jarvis-text-muted">
        <Terminal className="size-12 opacity-30 mb-4" />
        <span className="font-heading uppercase tracking-widest text-xs">Select Job to View Logs</span>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col relative bg-jarvis-bg-deepest">
      
      {/* Header */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-6 shrink-0 z-10 backdrop-blur-md">
        <div>
          <h2 className="text-sm font-heading font-bold text-jarvis-text truncate">
            {activeJob.title}
          </h2>
          <p className="text-[10px] text-jarvis-text-muted font-mono">ID: {activeJob.id}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MetaCard label="Scheduled For" value={activeJob.scheduledFor.toLocaleString()} icon={Calendar} />
          <MetaCard label="Status" value={activeJob.status} />
          <MetaCard label="Created At" value={activeJob.createdAt.toLocaleString()} />
          <MetaCard label="Retries" value={`${activeJob.retryConfig.currentAttempt} / ${activeJob.retryConfig.maxRetries}`} />
        </div>

        {/* Error State */}
        {activeJob.errorReason && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="size-4 text-red-500 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Fatal Exception</h4>
              <p className="text-sm text-red-400/80">{activeJob.errorReason}</p>
            </div>
          </div>
        )}

        {/* Live Execution Logs */}
        <div className="bg-[#0a0a0a] border border-jarvis-panel-border/50 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-jarvis-panel/30 border-b border-jarvis-panel-border/30 flex justify-between items-center">
            <span className="text-[10px] font-mono text-jarvis-text-muted uppercase tracking-widest flex items-center gap-2">
              <Terminal className="size-3" /> Execution Log
            </span>
            {activeJob.status === "RUNNING" && (
              <span className="flex size-2 rounded-full bg-jarvis-primary animate-pulse" />
            )}
          </div>
          <div className="p-4 font-mono text-[11px] space-y-2 h-[300px] overflow-y-auto">
            {activeJob.logs.map((log) => {
              const color = log.level === "ERROR" ? "text-red-400" : log.level === "WARN" ? "text-yellow-400" : "text-jarvis-primary/80";
              return (
                <div key={log.id} className="flex gap-3">
                  <span className="text-jarvis-text-muted shrink-0">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className={cn("font-bold shrink-0 w-[40px]", color)}>
                    {log.level}
                  </span>
                  <span className="text-jarvis-text/80 break-words flex-1">
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </ScrollArea>
    </div>
  );
}

function MetaCard({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="bg-jarvis-panel/10 border border-jarvis-panel-border/50 p-3 rounded-lg">
      <span className="text-[10px] text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="size-3" />} {label}
      </span>
      <span className="text-sm font-medium text-jarvis-text truncate block">{value}</span>
    </div>
  );
}
