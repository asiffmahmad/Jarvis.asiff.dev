"use client";

import { motion } from "framer-motion";
import { Plus, CalendarDays, LayoutList, Calendar, RefreshCw } from "lucide-react";
import type { CalendarState } from "@/lib/calendar/use-calendar";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  state: CalendarState;
}

export function CalendarToolbar({ state }: ToolbarProps) {
  const { view, setView } = state;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-jarvis-panel border border-jarvis-panel-border shadow-[0_0_40px_rgba(52,245,208,0.1)] rounded-full px-4 py-2 flex items-center gap-2 z-50 glass-strong"
    >
      <button 
        className="flex items-center gap-2 px-4 py-2 bg-jarvis-primary/10 hover:bg-jarvis-primary text-jarvis-primary hover:text-jarvis-bg-deepest rounded-full transition-all text-xs font-bold uppercase tracking-wider border border-jarvis-primary/30"
      >
        <Plus className="size-3" /> New Event
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />

      <div className="flex bg-jarvis-bg-deep/50 rounded-full p-1 border border-jarvis-panel-border/30">
        <ViewButton active={view === "MONTH"} onClick={() => setView("MONTH")} icon={Calendar} label="Month" />
        <ViewButton active={view === "WEEK"} onClick={() => setView("WEEK")} icon={CalendarDays} label="Week" />
        <ViewButton active={view === "AGENDA"} onClick={() => setView("AGENDA")} icon={LayoutList} label="Agenda" />
      </div>

      <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />
      
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-jarvis-panel/50 text-jarvis-text rounded-full transition-colors text-xs font-bold uppercase tracking-widest border border-transparent">
        <RefreshCw className="size-3" /> Sync
      </button>
    </motion.div>
  );
}

function ViewButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-xs font-bold uppercase tracking-widest",
        active ? "bg-jarvis-primary/20 text-jarvis-primary" : "text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel/50"
      )}
    >
      <Icon className="size-3" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
