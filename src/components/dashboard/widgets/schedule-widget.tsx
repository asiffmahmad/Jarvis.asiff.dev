"use client";

import { CalendarClock, PenSquare, Mail, Calendar, CheckSquare } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { type ScheduleItem } from "@/services/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ScheduleWidgetProps {
  data?: ScheduleItem[];
  isLoading: boolean;
}

const typeConfig = {
  content: { icon: PenSquare, color: "text-jarvis-primary", bg: "bg-jarvis-primary/10" },
  email: { icon: Mail, color: "text-jarvis-secondary", bg: "bg-jarvis-secondary/10" },
  event: { icon: Calendar, color: "text-jarvis-accent", bg: "bg-jarvis-accent/10" },
  task: { icon: CheckSquare, color: "text-jarvis-success", bg: "bg-jarvis-success/10" },
};

export function ScheduleWidget({ data, isLoading }: ScheduleWidgetProps) {
  return (
    <DashboardCard
      title="Today's Schedule"
      icon={<CalendarClock className="size-4" />}
      isLoading={isLoading}
      className="col-span-1 md:col-span-2 lg:col-span-1 row-span-2"
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
                  className="group flex items-start gap-3 rounded-[10px] p-3 hover:bg-jarvis-panel/40 transition-colors border border-transparent hover:border-jarvis-border"
                >
                  <div
                    className={cn(
                      "mt-0.5 size-8 rounded-[8px] flex items-center justify-center shrink-0 border border-transparent group-hover:border-jarvis-border-strong transition-all",
                      Config.bg
                    )}
                  >
                    <Icon className={cn("size-4", Config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-jarvis-text truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-jarvis-text-muted mt-1 font-mono">
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
            {data.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-jarvis-text-muted text-sm">
                No items scheduled for today.
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </DashboardCard>
  );
}
