"use client";

import { motion } from "framer-motion";
import { Activity, Server, AlertTriangle, Workflow } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { globalEventBus } from "@/lib/events/event-bus";
import { cn } from "@/lib/utils";

export function DashboardLeftPanel() {
  const [metrics, setMetrics] = useState({
    queuedTasks: 0,
    runningWorkflows: 0,
    alerts: 0
  });

  useEffect(() => {
    const unsub = globalEventBus.subscribe('*', (e) => {
      if (e.type === 'workflow:started') setMetrics(m => ({ ...m, runningWorkflows: m.runningWorkflows + 1 }));
      if (e.type === 'workflow:completed') setMetrics(m => ({ ...m, runningWorkflows: Math.max(0, m.runningWorkflows - 1) }));
      if (e.type === 'system:alert' || e.type === 'agent:failed') setMetrics(m => ({ ...m, alerts: m.alerts + 1 }));
    });
    return () => unsub();
  }, []);

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
              <HealthBar label="CPU Load (Simulated)" value={24} color="#34F5D0" />
              <HealthBar label="Memory Usage" value={68} color="#F5A623" />
              <HealthBar label="Database I/O" value={12} color="#34F5D0" />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Workflow className="size-3" /> Execution Queue
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <MetricBox label="Running" value={metrics.runningWorkflows.toString()} color="text-[#34F5D0]" />
              <MetricBox label="Queued" value={metrics.queuedTasks.toString()} color="text-jarvis-text-muted" />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle className="size-3" /> Active Alerts
            </h3>
            {metrics.alerts === 0 ? (
              <div className="p-3 text-xs text-jarvis-text-muted text-center border border-jarvis-panel-border/30 rounded bg-jarvis-panel/10">
                All systems nominal.
              </div>
            ) : (
              <div className="p-3 text-xs text-[#FF4D4D] text-center border border-[#FF4D4D]/30 rounded bg-[#FF4D4D]/10">
                {metrics.alerts} active alert(s)
              </div>
            )}
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
