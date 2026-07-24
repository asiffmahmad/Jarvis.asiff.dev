"use client";

import { motion } from "framer-motion";
import { Sparkles, Calendar, Filter } from "lucide-react";
import type { AnalyticsState } from "@/lib/analytics/use-analytics";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/analytics/types";

interface RightPanelProps {
  state: AnalyticsState;
}

const RANGES: { id: DateRange; label: string }[] = [
  { id: "7D", label: "Last 7 Days" },
  { id: "30D", label: "Last 30 Days" },
  { id: "90D", label: "Last 90 Days" },
  { id: "YTD", label: "Year to Date" },
  { id: "ALL", label: "All Time" },
];

export function AnalyticsRightPanel({ state }: RightPanelProps) {
  const { dateRange, setDateRange } = state;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 z-10 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Controls
        </h2>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Date Range */}
        <section>
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Calendar className="size-3" /> Date Range
          </h3>
          <div className="space-y-1.5">
            {RANGES.map(r => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors border",
                  dateRange === r.id
                    ? "bg-jarvis-primary/10 border-jarvis-primary/30 text-jarvis-primary"
                    : "bg-jarvis-panel/10 border-transparent text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel/30"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section>
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Filter className="size-3" /> Filters
          </h3>
          <div className="text-xs text-jarvis-text-muted/50 italic p-4 text-center border border-dashed border-jarvis-panel-border/30 rounded-lg">
            No platform filters available for this view.
          </div>
        </section>

        {/* AI Insights Placeholder */}
        <section>
          <div className="bg-jarvis-primary/5 border border-jarvis-primary/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(52,245,208,0.05)]">
            <div className="bg-jarvis-primary/10 px-4 py-3 flex items-center justify-between border-b border-jarvis-primary/20">
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-jarvis-primary flex items-center gap-2 text-glow">
                <Sparkles className="size-3" /> Executive Summary
              </span>
            </div>
            
            <div className="p-4 space-y-3">
              <p className="text-xs text-jarvis-text/80 leading-relaxed">
                Growth remains steady across social platforms. Your engagement rate is up 4% compared to the previous period.
              </p>
              <button className="w-full py-1.5 rounded bg-jarvis-primary/20 text-jarvis-primary text-[10px] font-bold uppercase tracking-widest border border-jarvis-primary/30 hover:bg-jarvis-primary hover:text-jarvis-bg-deepest transition-colors">
                Generate Full Analysis
              </button>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
