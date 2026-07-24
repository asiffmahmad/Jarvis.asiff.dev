"use client";

import { BarChart3, TrendingUp, TrendingDown, Users, Eye, Zap } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { type AnalyticsData } from "@/services/dashboard";
import { formatCompact, cn } from "@/lib/utils";

interface AnalyticsPreviewWidgetProps {
  data?: AnalyticsData;
  isLoading: boolean;
}

export function AnalyticsPreviewWidget({ data, isLoading }: AnalyticsPreviewWidgetProps) {
  const renderMetric = (label: string, icon: React.ReactNode, value: number, trend: number) => {
    const isPositive = trend > 0;
    return (
      <div className="flex flex-col p-3 rounded-[10px] bg-jarvis-panel/30 border border-jarvis-border/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-jarvis-text-muted">{icon}</div>
          <span className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-end justify-between mt-auto">
          <span className="font-mono text-lg text-jarvis-text">{formatCompact(value)}</span>
          <div className={cn("flex items-center gap-0.5 text-xs font-mono", isPositive ? "text-jarvis-success" : "text-jarvis-danger")}>
            {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(trend)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardCard
      title="Global Analytics"
      icon={<BarChart3 className="size-4" />}
      isLoading={isLoading}
      className="col-span-1 md:col-span-2"
    >
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-full">
          {renderMetric("Views", <Eye className="size-3.5" />, data.views.total, data.views.trend)}
          {renderMetric("Followers", <Users className="size-3.5" />, data.followers.total, data.followers.trend)}
          {renderMetric("Reach", <GlobeIcon className="size-3.5" />, data.reach.total, data.reach.trend)}
          {renderMetric("Engagement", <Zap className="size-3.5" />, data.engagement.total, data.engagement.trend)}
        </div>
      )}
    </DashboardCard>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}
