"use client";

import { motion } from "framer-motion";
import { Activity, Server, Database } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function DashboardLeftPanel() {
  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg flex items-center gap-2">
          <Activity className="size-5" /> Mission Control
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          System Overview
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        
        <div className="space-y-6">
          
          <section>
            <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Server className="size-3" /> System Health
            </h3>
            <div className="space-y-3">
              <HealthBar label="DB Connectivity" value={100} color="#34F5D0" />
              <HealthBar label="API Sync" value={100} color="#34F5D0" />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Database className="size-3" /> Data Core
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <MetricBox label="Content" value="0" color="text-jarvis-text-muted" />
              <MetricBox label="Workflows" value="0" color="text-jarvis-text-muted" />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="size-3" /> Actionable Items
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <MetricBox label="Unread Mail" value="0" color="text-jarvis-text-muted" />
              <MetricBox label="Upcoming" value="0" color="text-jarvis-text-muted" />
            </div>
          </section>

        </div>

      </ScrollArea>
    </motion.aside>
  );
}

function HealthBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-jarvis-text">{label}</span>
        <span className="text-jarvis-text-muted">{value}%</span>
      </div>
      <div className="h-1 w-full bg-jarvis-panel-border/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function MetricBox({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-3 bg-jarvis-panel/20 border border-jarvis-panel-border/30 rounded flex flex-col items-center justify-center">
      <span className={cn("text-xl font-bold font-mono", color)}>{value}</span>
      <span className="text-[9px] uppercase tracking-widest text-jarvis-text-muted mt-1">{label}</span>
    </div>
  );
}
