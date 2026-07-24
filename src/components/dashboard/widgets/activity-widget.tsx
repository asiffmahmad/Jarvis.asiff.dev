"use client";

import { History, Brain, Mail, Settings2, FileText, Globe } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { type ActivityItem } from "@/services/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ActivityWidgetProps {
  data?: ActivityItem[];
  isLoading: boolean;
}

const typeConfig = {
  ai: { icon: Brain, color: "text-jarvis-primary", glow: "shadow-[0_0_10px_rgba(52,245,208,0.4)]" },
  email: { icon: Mail, color: "text-jarvis-secondary", glow: "shadow-[0_0_10px_rgba(92,245,255,0.4)]" },
  automation: { icon: Settings2, color: "text-jarvis-warning", glow: "shadow-[0_0_10px_rgba(248,227,107,0.4)]" },
  content: { icon: FileText, color: "text-jarvis-accent", glow: "shadow-[0_0_10px_rgba(138,92,255,0.4)]" },
  research: { icon: Globe, color: "text-jarvis-success", glow: "shadow-[0_0_10px_rgba(66,255,152,0.4)]" },
};

export function ActivityWidget({ data, isLoading }: ActivityWidgetProps) {
  return (
    <DashboardCard
      title="Recent Activity"
      icon={<History className="size-4" />}
      isLoading={isLoading}
      className="col-span-1 md:col-span-2 lg:col-span-1 row-span-2"
    >
      {data && (
        <ScrollArea className="h-full -mx-2 px-2">
          <div className="relative pl-3 pb-4 space-y-6 before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-jarvis-border/50">
            {data.map((item) => {
              const Config = typeConfig[item.type];
              const Icon = Config.icon;

              return (
                <div key={item.id} className="relative flex items-start gap-4 pr-2">
                  <div className={cn("absolute -left-1 mt-1 size-2.5 rounded-full bg-jarvis-bg-deepest border-[2px] border-jarvis-panel z-10 flex items-center justify-center", Config.glow, Config.color.replace("text-", "border-"))}>
                    <Icon className={cn("size-1.5 opacity-0")} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-jarvis-text truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-jarvis-text-muted font-mono shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-jarvis-text-muted line-clamp-2">
                      {item.description}
                    </p>
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
