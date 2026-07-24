"use client";

import { useState, useRef } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Sparkles, CheckSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarState } from "@/lib/calendar/use-calendar";
import ReactMarkdown from "react-markdown";

interface RightPanelProps {
  state: CalendarState;
}

export function CalendarRightPanel({ state }: RightPanelProps) {
  const { activeEvent, activeTask, events } = state;
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerateInsights = async () => {
    if (isGeneratingInsights) return;
    
    setIsGeneratingInsights(true);
    setInsights("");
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/calendar/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "daily_summary",
          calendarData: events.map(e => ({ title: e.title, start: e.startDate, category: e.category }))
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Execution failed");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let chunk;
        while (!(chunk = await reader.read()).done) {
          const text = decoder.decode(chunk.value, { stream: true });
          const lines = text.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              const content = JSON.parse(line.slice(2));
              setInsights(prev => (prev || "") + content);
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setInsights(`[ERROR: ${(err as Error).message}]`);
      }
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col p-6">
      <div className="bg-jarvis-panel/20 border border-jarvis-primary/30 rounded-xl overflow-hidden relative shadow-[0_0_20px_rgba(52,245,208,0.05)] mb-6 flex-shrink-0">
        <div className="bg-jarvis-primary/10 px-4 py-3 flex items-center justify-between border-b border-jarvis-primary/20">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-jarvis-primary flex items-center gap-2 text-glow">
            <Sparkles className="size-3" /> Daily Briefing
          </span>
          <button 
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            className="text-[10px] px-3 py-1 bg-jarvis-primary/20 hover:bg-jarvis-primary hover:text-jarvis-bg-deepest text-jarvis-primary rounded transition-colors border border-jarvis-primary/50 disabled:opacity-50"
          >
            {isGeneratingInsights ? "Analyzing..." : "Generate Insights"}
          </button>
        </div>
        
        <ScrollArea className="h-[300px]">
          {insights ? (
            <div className="p-4 prose prose-invert prose-jarvis text-sm max-w-none">
              <ReactMarkdown>{insights}</ReactMarkdown>
              {isGeneratingInsights && <span className="inline-block w-1 h-3 ml-1 bg-jarvis-primary animate-pulse" />}
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center h-full text-jarvis-text-muted/50 text-center">
              <BotIcon className="size-10 mb-3 opacity-30" />
              <p className="text-xs uppercase tracking-widest">Click generate for AI schedule analysis</p>
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-jarvis-text-muted opacity-30">
        <CalendarIcon className="size-16 mb-4" />
        <span className="font-heading uppercase tracking-widest text-xs">Select an event or task</span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col relative bg-jarvis-bg-deepest h-full">
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-6 shrink-0 z-10 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Inspector
        </h2>
      </div>

      {!activeEvent && !activeTask ? renderEmptyState() : (
        <ScrollArea className="flex-1 p-6">
          {activeEvent && (
            <div className="space-y-6">
              <div>
                <span className="inline-block px-2 py-1 bg-jarvis-panel/50 text-jarvis-text-muted text-[10px] uppercase tracking-widest rounded mb-3">
                  {activeEvent.category} Event
                </span>
                <h3 className="text-xl font-bold text-jarvis-text leading-tight mb-2">{activeEvent.title}</h3>
                <p className="text-sm text-jarvis-text-muted">{activeEvent.description || "No description provided."}</p>
              </div>

              <div className="bg-jarvis-panel/10 border border-jarvis-panel-border/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3 text-sm text-jarvis-text">
                  <Clock className="size-4 text-jarvis-primary" />
                  <div>
                    <p className="font-medium">{activeEvent.startDate.toLocaleDateString()}</p>
                    <p className="text-xs text-jarvis-text-muted">
                      {activeEvent.startDate.toLocaleTimeString()} - {activeEvent.endDate.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-jarvis-text">
                  <MapPin className="size-4 text-jarvis-primary" />
                  <p className="font-medium">JARVIS Workspace Sync</p>
                </div>
              </div>
            </div>
          )}

          {activeTask && (
            <div className="space-y-6">
              <div>
                <span className="inline-block px-2 py-1 bg-jarvis-panel/50 text-jarvis-text-muted text-[10px] uppercase tracking-widest rounded mb-3">
                  {activeTask.category} Task
                </span>
                <h3 className="text-xl font-bold text-jarvis-text leading-tight mb-2">{activeTask.title}</h3>
              </div>

              <div className="bg-jarvis-panel/10 border border-jarvis-panel-border/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3 text-sm text-jarvis-text">
                  <Clock className="size-4 text-jarvis-primary" />
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p className="text-xs text-jarvis-text-muted">{activeTask.dueDate.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-jarvis-text">
                  <CheckSquare className="size-4 text-jarvis-primary" />
                  <p className="font-medium">Status: {activeTask.isCompleted ? "Completed" : "Pending"}</p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
  );
}
