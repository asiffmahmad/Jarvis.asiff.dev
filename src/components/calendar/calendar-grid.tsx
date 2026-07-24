"use client";

import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, GripVertical } from "lucide-react";
import type { CalendarState } from "@/lib/calendar/use-calendar";
import { cn } from "@/lib/utils";

interface GridProps {
  state: CalendarState;
}

export function CalendarGrid({ state }: GridProps) {
  const { events, view, currentDate, setSelectedEventId, activeEvent } = state;

  // We are heavily mocking the grid view since we don't have a massive external calendar library installed (like react-big-calendar).
  // The goal is to show the architectural layout.

  const renderAgendaView = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {events.map((evt) => {
        const isSelected = activeEvent?.id === evt.id;
        return (
          <motion.div
            key={evt.id}
            layoutId={evt.id}
            onClick={() => setSelectedEventId(evt.id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border border-jarvis-panel-border/50 cursor-pointer transition-all",
              isSelected ? "bg-jarvis-panel/50 border-jarvis-primary shadow-[0_0_15px_rgba(52,245,208,0.1)]" : "bg-jarvis-panel/20 hover:bg-jarvis-panel/30"
            )}
          >
            <div className="shrink-0 w-24 text-right">
              <p className="text-sm font-bold text-jarvis-text">
                {evt.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest font-mono mt-1">
                {evt.isAllDay ? "ALL DAY" : "SCHEDULED"}
              </p>
            </div>
            
            <div className="w-1 h-12 bg-jarvis-primary/50 rounded-full" />
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-jarvis-text">{evt.title}</h4>
              <p className="text-xs text-jarvis-text-muted flex items-center gap-2 mt-1">
                <span className="bg-jarvis-panel-border px-2 py-0.5 rounded text-[10px] uppercase">{evt.category}</span>
                {evt.description && <span className="truncate max-w-[200px]">{evt.description}</span>}
              </p>
            </div>
            
            <GripVertical className="size-4 text-jarvis-text-muted opacity-30 hover:opacity-100 cursor-grab" />
          </motion.div>
        );
      })}
    </div>
  );

  const renderMonthGrid = () => (
    <div className="flex-1 p-6 flex flex-col">
      <div className="grid grid-cols-7 gap-4 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-xs font-bold text-jarvis-text-muted uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 gap-4">
        {/* Mock 35 days for a calendar view */}
        {Array.from({length: 35}).map((_, i) => {
          const dayEvents = events.filter(() => Math.random() > 0.8); // randomly assign some events
          
          return (
            <div key={i} className="bg-jarvis-panel/10 border border-jarvis-panel-border/30 rounded-lg p-2 min-h-[100px] flex flex-col">
              <span className="text-xs text-jarvis-text-muted font-bold mb-2">{i % 31 + 1}</span>
              <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                {dayEvents.slice(0, 3).map((e, idx) => (
                  <div key={idx} className="bg-jarvis-primary/20 text-jarvis-primary text-[10px] px-1.5 py-0.5 rounded truncate font-medium">
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-jarvis-text-muted text-center">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      
      {/* Header */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center justify-between px-6 shrink-0 relative z-10 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
          <CalendarIcon className="size-4 text-jarvis-primary" /> {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-4 text-xs font-mono text-jarvis-text-muted">
          <span className="flex items-center gap-1"><Clock className="size-3" /> UTC+0</span>
        </div>
      </div>

      {view === "AGENDA" ? renderAgendaView() : renderMonthGrid()}

    </div>
  );
}
