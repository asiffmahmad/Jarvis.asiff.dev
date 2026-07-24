"use client";

import { Server, Database, Network, Cpu, HardDrive, BrainCircuit } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { type SystemHealthData } from "@/services/dashboard";
import { ActivityPulse } from "../shared/activity-pulse";
import { cn } from "@/lib/utils";

interface SystemHealthWidgetProps {
  data?: SystemHealthData;
  isLoading: boolean;
}

export function SystemHealthWidget({ data, isLoading }: SystemHealthWidgetProps) {
  const getStatusPulse = (status?: string) => {
    if (status === "healthy") return "active";
    if (status === "degraded") return "idle";
    return "error";
  };

  return (
    <DashboardCard
      title="System Health"
      icon={<Server className="size-4" />}
      isLoading={isLoading}
      className="col-span-1 md:col-span-2 lg:col-span-1"
    >
      {data && (
        <div className="flex flex-col h-full justify-between gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-[8px] bg-jarvis-panel/20 border border-jarvis-border/50">
              <Database className="size-3.5 text-jarvis-text-muted" />
              <span className="text-xs text-jarvis-text-muted font-mono flex-1">DB</span>
              <ActivityPulse status={getStatusPulse(data.database)} size="sm" />
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[8px] bg-jarvis-panel/20 border border-jarvis-border/50">
              <Network className="size-3.5 text-jarvis-text-muted" />
              <span className="text-xs text-jarvis-text-muted font-mono flex-1">API</span>
              <ActivityPulse status={getStatusPulse(data.api)} size="sm" />
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[8px] bg-jarvis-panel/20 border border-jarvis-border/50">
              <Server className="size-3.5 text-jarvis-text-muted" />
              <span className="text-xs text-jarvis-text-muted font-mono flex-1">App</span>
              <ActivityPulse status={getStatusPulse(data.app)} size="sm" />
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[8px] bg-jarvis-panel/20 border border-jarvis-border/50">
              <BrainCircuit className="size-3.5 text-jarvis-text-muted" />
              <span className="text-xs text-jarvis-text-muted font-mono flex-1">AI</span>
              <ActivityPulse status={getStatusPulse(data.ai)} size="sm" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-jarvis-text-muted">
                <span className="flex items-center gap-1.5"><HardDrive className="size-3" /> Storage</span>
                <span>{data.storageUsagePct}%</span>
              </div>
              <div className="h-1 bg-jarvis-panel rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", data.storageUsagePct > 80 ? "bg-jarvis-danger" : "bg-jarvis-primary")}
                  style={{ width: `${data.storageUsagePct}%` }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-jarvis-text-muted">
                <span className="flex items-center gap-1.5"><Cpu className="size-3" /> Memory</span>
                <span>{data.memoryUsagePct}%</span>
              </div>
              <div className="h-1 bg-jarvis-panel rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", data.memoryUsagePct > 80 ? "bg-jarvis-warning" : "bg-jarvis-secondary")}
                  style={{ width: `${data.memoryUsagePct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
