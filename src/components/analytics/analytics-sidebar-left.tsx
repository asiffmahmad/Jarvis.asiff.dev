"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Users, PenTool, Mail, TrendingUp, Activity, FileBarChart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AnalyticsState } from "@/lib/analytics/use-analytics";
import type { AnalyticsCategory } from "@/lib/analytics/types";

interface SidebarProps {
  state: AnalyticsState;
}

const CATEGORIES: { id: AnalyticsCategory; label: string; icon: React.ElementType }[] = [
  { id: "SOCIAL", label: "Social Media", icon: LayoutDashboard },
  { id: "CONTENT", label: "Content Performance", icon: PenTool },
  { id: "EMAIL", label: "Email Metrics", icon: Mail },
  { id: "AUDIENCE", label: "Audience Demographics", icon: Users },
  { id: "GROWTH", label: "Growth Trends", icon: TrendingUp },
  { id: "ENGAGEMENT", label: "Engagement Insights", icon: Activity },
];

export function AnalyticsSidebarLeft({ state }: SidebarProps) {
  const { category, setCategory } = state;

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg">
          Intelligence
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          BI Engine Active
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 mb-6 mt-2">
          <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2">Dashboards</h3>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            const Icon = cat.icon;
            
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 group text-sm font-medium",
                  isSelected
                    ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
                    : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
                )}
              >
                <Icon className={cn("size-4", isSelected ? "text-jarvis-primary" : "opacity-50")} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="px-2">
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2">Saved Reports</h3>
          <button className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 group text-sm font-medium text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent">
            <FileBarChart className="size-4 opacity-50" /> Q3 Performance
          </button>
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
