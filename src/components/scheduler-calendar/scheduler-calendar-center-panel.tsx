"use client";

import { motion } from "framer-motion";
import {
  CalendarDays, Clock, XCircle, RotateCcw, Play, AlertCircle,
  CheckCircle2, Loader2
} from "lucide-react";
import type { SchedulerCalendarState } from "@/lib/scheduler-calendar/use-scheduler-calendar";
import { cn } from "@/lib/utils";

interface CenterPanelProps {
  state: SchedulerCalendarState;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  DRAFT: { label: "Draft", color: "text-jarvis-text-muted", bg: "bg-jarvis-panel/30", icon: Clock },
  SCHEDULED: { label: "Scheduled", color: "text-[#34F5D0]", bg: "bg-[#34F5D0]/10", icon: Clock },
  WAITING: { label: "Waiting", color: "text-[#F5A623]", bg: "bg-[#F5A623]/10", icon: Loader2 },
  RUNNING: { label: "Running", color: "text-[#F5A623]", bg: "bg-[#F5A623]/10", icon: Loader2 },
  SUCCESS: { label: "Completed", color: "text-[#34F5D0]", bg: "bg-[#34F5D0]/10", icon: CheckCircle2 },
  FAILED: { label: "Failed", color: "text-[#FF4D4D]", bg: "bg-[#FF4D4D]/10", icon: AlertCircle },
  CANCELLED: { label: "Cancelled", color: "text-jarvis-text-muted", bg: "bg-jarvis-panel/30", icon: XCircle },
};

export function SchedulerCalendarCenterPanel({ state }: CenterPanelProps) {
  const { jobs, activeJobId, setActiveJobId, cancelJob, retryJob, runNow, viewFilter, setViewFilter } = state;

  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      <div className="p-6 border-b border-jarvis-panel/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="size-6 text-jarvis-primary" />
            <h1 className="text-2xl font-heading font-bold text-jarvis-text uppercase tracking-widest">
              Schedule
            </h1>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-4">
          {["ALL", "SCHEDULED", "RUNNING", "COMPLETED", "FAILED"].map((f) => (
            <button
              key={f}
              onClick={() => setViewFilter(f as typeof viewFilter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border",
                viewFilter === f
                  ? "bg-jarvis-primary/10 border-jarvis-primary/40 text-jarvis-primary"
                  : "bg-jarvis-panel/50 border-jarvis-panel-border text-jarvis-text-muted hover:text-jarvis-text"
              )}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-jarvis-text-muted opacity-50">
            <CalendarDays className="size-12 mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-center">No scheduled posts</p>
            <p className="text-[10px] font-mono text-jarvis-text-muted/50 mt-2">Posts you schedule will appear here</p>
          </div>
        ) : (
          jobs.map((job, idx) => {
            const cfg = statusConfig[job.status] || statusConfig.DRAFT;
            const Icon = cfg.icon;
            const payload = job.payload as { post?: { title?: string; caption?: string; platform?: string }; platform?: string } | undefined;

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setActiveJobId(job.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                  activeJobId === job.id
                    ? "bg-jarvis-panel border-jarvis-primary/40 shadow-[0_0_20px_rgba(52,245,208,0.05)]"
                    : "bg-jarvis-panel/30 border-jarvis-panel-border/50 hover:bg-jarvis-panel/50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-jarvis-text truncate">{job.title}</h3>
                    {payload?.post?.caption && (
                      <p className="text-xs text-jarvis-text-muted mt-1 line-clamp-2">{payload.post.caption}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", cfg.bg, cfg.color)}>
                        <Icon className={cn("size-3", job.status === "RUNNING" && "animate-spin")} />
                        {cfg.label}
                      </span>
                      {payload?.platform && (
                        <span className="text-[10px] text-jarvis-text-muted font-mono uppercase">{payload.platform}</span>
                      )}
                      <span className="text-[10px] text-jarvis-text-muted font-mono">
                        {new Date(job.scheduledFor).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {(job.status === "SCHEDULED" || job.status === "WAITING") && (
                    <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => runNow(job.id)} className="p-1.5 rounded-lg hover:bg-[#34F5D0]/10 text-jarvis-text-muted hover:text-[#34F5D0] transition-colors" title="Run Now">
                        <Play className="size-3.5" />
                      </button>
                      <button onClick={() => cancelJob(job.id)} className="p-1.5 rounded-lg hover:bg-[#FF4D4D]/10 text-jarvis-text-muted hover:text-[#FF4D4D] transition-colors" title="Cancel">
                        <XCircle className="size-3.5" />
                      </button>
                    </div>
                  )}
                  {(job.status === "FAILED" || job.status === "CANCELLED") && (
                    <button onClick={(e) => { e.stopPropagation(); retryJob(job.id); }} className="p-1.5 rounded-lg hover:bg-[#F5A623]/10 text-jarvis-text-muted hover:text-[#F5A623] transition-colors shrink-0" title="Retry">
                      <RotateCcw className="size-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
