"use client";

import { Link as LinkIcon, CheckCircle2, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { type ConnectedService } from "@/services/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ConnectedServicesWidgetProps {
  data?: ConnectedService[];
  isLoading: boolean;
}

export function ConnectedServicesWidget({ data, isLoading }: ConnectedServicesWidgetProps) {
  const getStatusDisplay = (status: ConnectedService["status"]) => {
    switch (status) {
      case "connected":
        return { icon: CheckCircle2, color: "text-jarvis-success", bg: "bg-jarvis-success/10", label: "Connected" };
      case "error":
        return { icon: AlertCircle, color: "text-jarvis-danger", bg: "bg-jarvis-danger/10", label: "Error" };
      case "syncing":
        return { icon: RefreshCw, color: "text-jarvis-warning", bg: "bg-jarvis-warning/10", label: "Syncing", animate: "animate-spin" };
      case "disconnected":
        return { icon: XCircle, color: "text-jarvis-text-muted", bg: "bg-jarvis-panel", label: "Disconnected" };
    }
  };

  return (
    <DashboardCard
      title="Integrations"
      icon={<LinkIcon className="size-4" />}
      isLoading={isLoading}
      className="col-span-1 md:col-span-2 lg:col-span-1"
    >
      {data && (
        <ScrollArea className="h-full -mx-2 px-2">
          <div className="grid grid-cols-2 gap-2 pb-4">
            {data.map((service) => {
              const display = getStatusDisplay(service.status);
              const StatusIcon = display.icon;

              return (
                <div
                  key={service.id}
                  className="flex flex-col gap-2 p-2.5 rounded-[8px] bg-jarvis-panel/30 border border-jarvis-border/50 hover:bg-jarvis-panel/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-jarvis-text">{service.name}</span>
                    <div className={cn("size-5 rounded-full flex items-center justify-center", display.bg)}>
                      <StatusIcon className={cn("size-3", display.color, display.animate)} />
                    </div>
                  </div>
                  <span className={cn("text-[9px] uppercase tracking-wider font-mono", display.color)}>
                    {display.label}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </DashboardCard>
  );
}
