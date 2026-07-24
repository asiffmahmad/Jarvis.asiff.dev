"use client";

import { motion } from "framer-motion";
import { Download, RefreshCw, LayoutTemplate } from "lucide-react";
import type { AnalyticsState } from "@/lib/analytics/use-analytics";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  state: AnalyticsState;
}

export function AnalyticsToolbar({ state }: ToolbarProps) {
  const { refresh, isLoading } = state;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-jarvis-panel border border-jarvis-panel-border shadow-[0_0_40px_rgba(52,245,208,0.1)] rounded-full px-4 py-2 flex items-center gap-2 z-50 glass-strong"
    >
      <button 
        onClick={refresh}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-jarvis-primary/10 hover:bg-jarvis-primary text-jarvis-primary hover:text-jarvis-bg-deepest rounded-full transition-all text-xs font-bold uppercase tracking-wider border border-jarvis-primary/30 disabled:opacity-50"
      >
        <RefreshCw className={cn("size-3", isLoading && "animate-spin")} /> {isLoading ? "Syncing..." : "Sync Data"}
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />
      
      <ToolButton icon={LayoutTemplate} label="Customize" />
      <ToolButton icon={Download} label="Export PDF" />

    </motion.div>
  );
}

function ToolButton({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled, 
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick?: () => void; 
  disabled?: boolean; 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors text-xs font-bold uppercase tracking-widest border border-transparent",
        disabled
          ? "opacity-30 cursor-not-allowed text-jarvis-text-muted"
          : "hover:bg-jarvis-panel/50 hover:border-jarvis-panel-border text-jarvis-text"
      )}
    >
      <Icon className="size-3" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
