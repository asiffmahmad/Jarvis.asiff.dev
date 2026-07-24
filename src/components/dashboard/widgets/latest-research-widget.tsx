"use client";

import { Newspaper, Bookmark, TrendingUp, Search } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { type ResearchItem } from "@/services/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LatestResearchWidgetProps {
  data?: ResearchItem[];
  isLoading: boolean;
}

const typeConfig = {
  news: { icon: Newspaper, color: "text-jarvis-primary" },
  bookmark: { icon: Bookmark, color: "text-jarvis-secondary" },
  trend: { icon: TrendingUp, color: "text-jarvis-accent" },
};

export function LatestResearchWidget({ data, isLoading }: LatestResearchWidgetProps) {
  return (
    <DashboardCard
      title="Intel Feed"
      icon={<Search className="size-4" />}
      isLoading={isLoading}
      className="col-span-1"
    >
      {data && (
        <ScrollArea className="h-full -mx-2 px-2">
          <div className="space-y-3 pb-4">
            {data.map((item) => {
              const Config = typeConfig[item.type];
              const Icon = Config.icon;

              return (
                <div
                  key={item.id}
                  className="group flex flex-col gap-1 rounded-[8px] p-2 hover:bg-jarvis-panel/30 transition-colors border border-transparent hover:border-jarvis-border/50"
                >
                  <div className="flex items-start gap-2">
                    <Icon className={cn("size-3.5 mt-0.5 shrink-0", Config.color)} />
                    <p className="text-xs font-medium text-jarvis-text line-clamp-2 leading-snug">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pl-5.5">
                    <span className="text-[9px] text-jarvis-text-muted uppercase tracking-wider font-mono">
                      {item.source}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </DashboardCard>
  );
}
