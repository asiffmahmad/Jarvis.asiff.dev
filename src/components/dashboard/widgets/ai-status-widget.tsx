"use client";

import { Brain } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { ActivityPulse } from "../shared/activity-pulse";
import { type AIStatusData } from "@/services/dashboard";

interface AIStatusWidgetProps {
  data?: AIStatusData;
  isLoading: boolean;
}

export function AIStatusWidget({ data, isLoading }: AIStatusWidgetProps) {
  return (
    <DashboardCard
      title="AI Core Status"
      icon={<Brain className="size-4" />}
      isLoading={isLoading}
      glowColor="success"
      className="col-span-1"
      action={<ActivityPulse status={data?.status === "operational" ? "active" : "error"} />}
    >
      {data && (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-bold text-jarvis-text text-glow tracking-wide">
                {data.provider}
              </span>
            </div>
            <p className="text-sm text-jarvis-primary font-mono tracking-wider">
              {data.model}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">
                Token Usage
              </p>
              <p className="font-mono text-sm text-jarvis-text">
                {(data.tokenUsage / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">
                Response
              </p>
              <p className="font-mono text-sm text-jarvis-text">
                {data.responseTimeMs}ms
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">
                Active Agents
              </p>
              <p className="font-mono text-sm text-jarvis-text">
                {data.activeConversations}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">
                Queue
              </p>
              <p className="font-mono text-sm text-jarvis-text">
                {data.currentTasks}
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
