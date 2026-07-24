"use client";

import { Terminal, Clock } from "lucide-react";
import type { SchedulerCalendarState } from "@/lib/scheduler-calendar/use-scheduler-calendar";

interface RightPanelProps {
  state: SchedulerCalendarState;
}

export function SchedulerCalendarRightPanel({ state }: RightPanelProps) {
  const { activeJob } = state;

  return (
    <div className="w-[350px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20">
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Job Details
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!activeJob ? (
          <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
            <Clock className="size-8 mb-2" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-center">Select a scheduled post</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-jarvis-text">{activeJob.title}</h3>
              <p className="text-[10px] text-jarvis-text-muted font-mono mt-1">ID: {activeJob.id}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded bg-jarvis-panel/30 border border-jarvis-panel-border/30">
                <span className="text-[10px] uppercase text-jarvis-text-muted">Status</span>
                <span className="text-[10px] font-bold uppercase" style={{
                  color: activeJob.status === "SCHEDULED" ? "#34F5D0" :
                         activeJob.status === "FAILED" ? "#FF4D4D" :
                         activeJob.status === "RUNNING" ? "#F5A623" :
                         activeJob.status === "SUCCESS" ? "#34F5D0" :
                         "#666"
                }}>
                  {activeJob.status}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded bg-jarvis-panel/30 border border-jarvis-panel-border/30">
                <span className="text-[10px] uppercase text-jarvis-text-muted">Type</span>
                <span className="text-[10px] font-mono text-jarvis-text">{activeJob.type}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-jarvis-panel/30 border border-jarvis-panel-border/30">
                <span className="text-[10px] uppercase text-jarvis-text-muted">Scheduled</span>
                <span className="text-[10px] font-mono text-jarvis-text">{new Date(activeJob.scheduledFor).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-jarvis-panel/30 border border-jarvis-panel-border/30">
                <span className="text-[10px] uppercase text-jarvis-text-muted">Created</span>
                <span className="text-[10px] font-mono text-jarvis-text">{new Date(activeJob.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Logs */}
            {activeJob.logs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="size-3 text-jarvis-text-muted" />
                  <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Logs</span>
                </div>
                <div className="space-y-1">
                  {activeJob.logs.map((log, i) => (
                    <div key={i} className="text-[10px] font-mono leading-relaxed">
                      <span className="text-jarvis-text-muted/50">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                      <span className={
                        log.level === 'ERROR' ? 'text-[#FF4D4D]' :
                        log.level === 'WARN' ? 'text-[#F5A623]' :
                        'text-jarvis-text/80'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
