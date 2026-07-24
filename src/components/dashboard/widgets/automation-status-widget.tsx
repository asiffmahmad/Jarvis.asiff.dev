"use client";

import { Activity } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { type AutomationStatusData } from "@/services/dashboard";

interface AutomationStatusWidgetProps {
  data?: AutomationStatusData;
  isLoading: boolean;
}

export function AutomationStatusWidget({ data, isLoading }: AutomationStatusWidgetProps) {
  const total = data ? data.running + data.queued + data.failed + data.completed : 0;
  const progress = total > 0 && data ? (data.completed / total) * 100 : 0;

  return (
    <DashboardCard
      title="Automations"
      icon={<Activity className="size-4" />}
      isLoading={isLoading}
      glowColor="primary"
      className="col-span-1"
    >
      {data && (
        <div className="flex items-center gap-6 h-full">
          {/* Progress Ring */}
          <div className="relative size-24 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-jarvis-panel stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              />
              <circle
                className="text-jarvis-primary stroke-current transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(52,245,208,0.5)]"
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * ((100 - progress) / 100)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-heading text-lg font-bold text-jarvis-text">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Stats List */}
          <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-4">
            <div>
              <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">Running</p>
              <p className="font-mono text-lg text-jarvis-text">{data.running}</p>
            </div>
            <div>
              <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">Queued</p>
              <p className="font-mono text-lg text-jarvis-text">{data.queued}</p>
            </div>
            <div>
              <p className="text-[10px] text-jarvis-danger uppercase tracking-widest">Failed</p>
              <p className="font-mono text-lg text-jarvis-text">{data.failed}</p>
            </div>
            <div>
              <p className="text-[10px] text-jarvis-success uppercase tracking-widest">Done</p>
              <p className="font-mono text-lg text-jarvis-text">{data.completed}</p>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
