"use client";

import { useRouter } from "next/navigation";
import { Zap, PenSquare, Mail, Globe, Image as ImageIcon, MessageSquare, Settings2, BarChart2 } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { cn } from "@/lib/utils";

const actions = [
  { icon: PenSquare, label: "Create Content", color: "text-jarvis-primary", bg: "bg-jarvis-primary/10", border: "hover:border-jarvis-primary/50", href: "/create" },
  { icon: Mail, label: "Open Gmail", color: "text-jarvis-secondary", bg: "bg-jarvis-secondary/10", border: "hover:border-jarvis-secondary/50", href: "/integrations" },
  { icon: Globe, label: "Research Topic", color: "text-jarvis-accent", bg: "bg-jarvis-accent/10", border: "hover:border-jarvis-accent/50", href: "/research" },
  { icon: ImageIcon, label: "Generate Carousel", color: "text-jarvis-success", bg: "bg-jarvis-success/10", border: "hover:border-jarvis-success/50", href: "/studio" },
  { icon: MessageSquare, label: "Generate Caption", color: "text-jarvis-primary", bg: "bg-jarvis-primary/10", border: "hover:border-jarvis-primary/50", href: "/agents" },
  { icon: Settings2, label: "New Automation", color: "text-jarvis-warning", bg: "bg-jarvis-warning/10", border: "hover:border-jarvis-warning/50", href: "/automation" },
  { icon: BarChart2, label: "Open Analytics", color: "text-jarvis-secondary", bg: "bg-jarvis-secondary/10", border: "hover:border-jarvis-secondary/50", href: "/analytics" },
];

export function QuickActionsWidget() {
  const router = useRouter();
  return (
    <DashboardCard
      title="Quick Actions"
      icon={<Zap className="size-4 text-jarvis-warning" />}
      className="col-span-1 md:col-span-2 lg:col-span-3"
      glowColor="warning"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 h-full">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              className={cn(
                "group flex flex-col items-center justify-center gap-3 p-4 rounded-[12px]",
                "bg-jarvis-panel/30 border border-jarvis-border transition-all duration-300",
                "hover:bg-jarvis-panel hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-jarvis-primary/50",
                action.border
              )}
              aria-label={action.label}
            >
              <div className={cn("size-10 rounded-[10px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110", action.bg)}>
                <Icon className={cn("size-5", action.color)} />
              </div>
              <span className="text-[10px] font-medium text-jarvis-text-muted group-hover:text-jarvis-text text-center leading-tight uppercase tracking-widest">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </DashboardCard>
  );
}
