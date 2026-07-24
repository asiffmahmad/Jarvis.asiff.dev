"use client";

import { motion } from "framer-motion";
import { User, FileText, Mail, Microscope, Bot, CheckSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CalendarState } from "@/lib/calendar/use-calendar";
import type { EventCategory } from "@/lib/calendar/types";

interface SidebarProps {
  state: CalendarState;
}

const CATEGORIES: { id: EventCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: "PERSONAL", label: "Personal Events", icon: User, color: "text-blue-400" },
  { id: "CONTENT", label: "Scheduled Content", icon: FileText, color: "text-purple-400" },
  { id: "EMAIL", label: "Email Schedule", icon: Mail, color: "text-green-400" },
  { id: "RESEARCH", label: "Research Tasks", icon: Microscope, color: "text-yellow-400" },
  { id: "AI_JOB", label: "AI Automations", icon: Bot, color: "text-jarvis-primary" },
];

export function CalendarSidebarLeft({ state }: SidebarProps) {
  const { activeFilters, toggleFilter, tasks, toggleTaskCompletion, setSelectedTaskId } = state;

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg mb-4">
          Calendar
        </h2>
        
        {/* Mini Calendar Mock */}
        <div className="bg-jarvis-panel/30 border border-jarvis-panel-border/50 rounded-xl p-3 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-jarvis-text">August 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-jarvis-text-muted mb-1">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Mock days */}
            {Array.from({length: 31}).map((_, i) => (
              <button
                key={i}
                onClick={() => state.setCurrentDate(new Date(new Date().getFullYear(), new Date().getMonth(), i + 1))}
                className={cn(
                  "p-1 rounded cursor-pointer hover:bg-jarvis-primary/20 text-center",
                  i + 1 === new Date().getDate() ? "bg-jarvis-primary text-jarvis-bg-deepest font-bold" : "text-jarvis-text"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3">
          Filters
        </h3>
        <div className="space-y-1 mb-6">
          {CATEGORIES.map((cat) => {
            const isActive = activeFilters.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleFilter(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-sm",
                  isActive ? "bg-jarvis-panel/30 text-jarvis-text" : "text-jarvis-text-muted opacity-50"
                )}
              >
                <cat.icon className={cn("size-4", cat.color)} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <CheckSquare className="size-3" /> Action Tasks
        </h3>
        <div className="space-y-2">
          {tasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => setSelectedTaskId(task.id)}
              className={cn(
                "p-2 rounded-lg border flex items-start gap-2 cursor-pointer transition-colors",
                task.isCompleted 
                  ? "border-jarvis-panel-border/30 bg-jarvis-panel/10 opacity-50" 
                  : "border-jarvis-panel-border bg-jarvis-panel/30 hover:bg-jarvis-panel/50"
              )}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(task.id); }}
                className={cn(
                  "size-4 shrink-0 rounded border mt-0.5 flex items-center justify-center transition-colors",
                  task.isCompleted ? "bg-jarvis-primary border-jarvis-primary text-jarvis-bg-deepest" : "border-jarvis-text-muted"
                )}
              >
                {task.isCompleted && <CheckSquare className="size-3" />}
              </button>
              <div className="flex-1 overflow-hidden">
                <p className={cn("text-xs font-medium truncate", task.isCompleted ? "line-through text-jarvis-text-muted" : "text-jarvis-text")}>
                  {task.title}
                </p>
                <p className="text-[9px] text-jarvis-text-muted font-mono mt-0.5">
                  Due {task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
