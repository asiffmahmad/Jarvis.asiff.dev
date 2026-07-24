"use client";

import { motion } from "framer-motion";
import { List, Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SchedulerCalendarState } from "@/lib/scheduler-calendar/use-scheduler-calendar";

interface SidebarProps {
  state: SchedulerCalendarState;
}

const SCHEDULER_VIEWS = [
  { id: "ALL", label: "All Posts", icon: List },
  { id: "UPCOMING", label: "Scheduled", icon: Clock },
  { id: "RUNNING", label: "Running", icon: Play },
  { id: "COMPLETED", label: "Completed", icon: CheckCircle2 },
  { id: "FAILED", label: "Failed", icon: XCircle },
] as const;

export function SchedulerCalendarSidebarLeft({ state }: SidebarProps) {
  const { viewFilter, setViewFilter, allJobs } = state;

  const counts = (filter: string) => {
    if (filter === "ALL") return allJobs.length;
    if (filter === "UPCOMING") return allJobs.filter(j => ["DRAFT", "SCHEDULED", "WAITING"].includes(j.status)).length;
    if (filter === "RUNNING") return allJobs.filter(j => j.status === "RUNNING").length;
    if (filter === "COMPLETED") return allJobs.filter(j => j.status === "SUCCESS").length;
    if (filter === "FAILED") return allJobs.filter(j => ["FAILED", "CANCELLED"].includes(j.status)).length;
    return 0;
  };

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg flex items-center gap-2">
          <Clock className="size-5" /> Schedule
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 font-mono">
          {allJobs.length} total post{allJobs.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 p-2 space-y-1">
        {SCHEDULER_VIEWS.map((view) => (
          <button
            key={view.id}
            onClick={() => setViewFilter(view.id as typeof viewFilter)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 text-left",
              viewFilter === view.id
                ? "bg-jarvis-primary/10 border border-jarvis-primary/30"
                : "hover:bg-jarvis-panel/50 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <view.icon className={cn(
                "size-4",
                viewFilter === view.id ? "text-jarvis-primary" : "text-jarvis-text-muted"
              )} />
              <span className={cn("text-sm font-bold", viewFilter === view.id ? "text-jarvis-primary" : "text-jarvis-text-muted")}>
                {view.label}
              </span>
            </div>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded",
              viewFilter === view.id ? "bg-jarvis-primary/20 text-jarvis-primary" : "bg-jarvis-panel/50 text-jarvis-text-muted"
            )}>
              {counts(view.id)}
            </span>
          </button>
        ))}
      </div>
    </motion.aside>
  );
}
