"use client";

import { motion } from "framer-motion";
import { RefreshCw, PlayCircle, Calendar, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import type { SchedulerState } from "@/lib/scheduler/use-scheduler";
import type { ScheduledJob, JobStatus } from "@/lib/scheduler/types";
import { cn } from "@/lib/utils";

interface CenterPanelProps {
  state: SchedulerState;
}

export function SchedulerCenterPanel({ state }: CenterPanelProps) {
  const { jobs, activeJobId, setActiveJobId } = state;

  return (
    <div className="flex-1 flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      
      {/* Header */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center justify-between px-6 shrink-0 relative z-10 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
          <Calendar className="size-4 text-jarvis-primary" /> Execution Queue
        </h2>
        <div className="flex gap-2">
          {/* Mock filters */}
          <span className="text-xs px-2 py-1 border border-jarvis-panel/50 rounded-lg text-jarvis-text-muted cursor-pointer hover:bg-jarvis-panel/20">All Types</span>
          <span className="text-xs px-2 py-1 border border-jarvis-panel/50 rounded-lg text-jarvis-text-muted cursor-pointer hover:bg-jarvis-panel/20">Today</span>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
            <RefreshCw className="size-8 mb-2" />
            <span className="font-heading uppercase tracking-widest text-xs">Queue Empty</span>
          </div>
        ) : (
          jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              isSelected={activeJobId === job.id} 
              onClick={() => setActiveJobId(job.id)} 
            />
          ))
        )}
      </div>

    </div>
  );
}

function JobCard({ job, isSelected, onClick }: { job: ScheduledJob; isSelected: boolean; onClick: () => void }) {
  const statusConfig: Record<JobStatus, { color: string; icon: React.ElementType }> = {
    DRAFT: { color: "text-gray-400", icon: Clock },
    SCHEDULED: { color: "text-blue-400", icon: Clock },
    WAITING: { color: "text-yellow-400", icon: RefreshCw },
    RUNNING: { color: "text-jarvis-primary", icon: PlayCircle },
    SUCCESS: { color: "text-green-400", icon: CheckCircle },
    FAILED: { color: "text-red-500", icon: ShieldAlert },
    CANCELLED: { color: "text-gray-500", icon: ShieldAlert },
    ARCHIVED: { color: "text-gray-600", icon: Clock },
  };

  const Icon = statusConfig[job.status].icon;

  return (
    <motion.div
      layoutId={job.id}
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all border-l-2",
        isSelected 
          ? "bg-jarvis-panel/30 border-jarvis-primary shadow-[0_0_15px_rgba(52,245,208,0.05)]" 
          : "bg-jarvis-panel/10 border-transparent hover:bg-jarvis-panel/20"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("size-2 rounded-full", job.status === "RUNNING" ? "bg-jarvis-primary animate-pulse" : "bg-transparent")} />
          <span className="text-sm font-bold text-jarvis-text">{job.title}</span>
        </div>
        <span className="text-[10px] text-jarvis-text-muted font-mono bg-jarvis-panel/50 px-2 py-0.5 rounded-full">
          {job.type}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-jarvis-text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            <span>{job.scheduledFor.toLocaleTimeString()}</span>
          </div>
          {job.retryConfig.currentAttempt > 0 && (
            <span className="text-yellow-400">Retry {job.retryConfig.currentAttempt}/{job.retryConfig.maxRetries}</span>
          )}
        </div>
        <div className={cn("flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]", statusConfig[job.status].color)}>
          <Icon className={cn("size-3", job.status === "RUNNING" || job.status === "WAITING" ? "animate-spin" : "")} />
          {job.status}
        </div>
      </div>
    </motion.div>
  );
}
