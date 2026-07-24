"use client";

import { motion } from "framer-motion";
import { List, Play, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SchedulerState } from "@/lib/scheduler/use-scheduler";

interface SidebarProps {
  state: SchedulerState;
}

const VIEWS = [
  { id: "ALL", label: "Timeline", icon: Calendar },
  { id: "UPCOMING", label: "Upcoming Queue", icon: List },
  { id: "RUNNING", label: "Active Jobs", icon: Play },
  { id: "COMPLETED", label: "Completed", icon: CheckCircle2 },
  { id: "FAILED", label: "Failed / Cancelled", icon: XCircle },
] as const;

export function SchedulerSidebarLeft({ state }: SidebarProps) {
  const { viewFilter, setViewFilter, allJobs } = state;

  const getCount = (filterId: string) => {
    switch (filterId) {
      case "ALL": return allJobs.length;
      case "UPCOMING": return allJobs.filter(j => ["DRAFT", "SCHEDULED", "WAITING"].includes(j.status)).length;
      case "RUNNING": return allJobs.filter(j => j.status === "RUNNING").length;
      case "COMPLETED": return allJobs.filter(j => j.status === "SUCCESS").length;
      case "FAILED": return allJobs.filter(j => ["FAILED", "CANCELLED"].includes(j.status)).length;
      default: return 0;
    }
  };

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg">
          Scheduler
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          Engine Active
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 mb-6 mt-2">
          {VIEWS.map((cat) => {
            const isSelected = viewFilter === cat.id;
            const count = getCount(cat.id);
            
            return (
              <button
                key={cat.id}
                onClick={() => setViewFilter(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-300 group",
                  isSelected
                    ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
                    : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <cat.icon className={cn("size-4", isSelected ? "text-jarvis-primary" : "text-jarvis-text-muted")} />
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                <span className={cn(
                  "text-xs font-mono px-2 py-0.5 rounded",
                  isSelected ? "bg-jarvis-primary/20 text-jarvis-primary" : "bg-jarvis-panel/50 text-jarvis-text-muted"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
