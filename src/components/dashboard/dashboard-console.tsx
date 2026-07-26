"use client";

import { motion } from "framer-motion";
import { Terminal, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentsState } from "@/lib/agents/use-agents";
import { useEffect, useRef } from "react";

interface ConsoleProps {
  agentsState: AgentsState;
}

export function DashboardConsole({ agentsState }: ConsoleProps) {
  const { executionState, activeAgent } = agentsState;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs stream in
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [executionState.logs.length]);

  const steps = [
    { label: "INITIALIZE", limit: 10 },
    { label: "CONTEXT READ", limit: 30 },
    { label: "NEURAL RESOLVE", limit: 60 },
    { label: "VERIFYING", limit: 80 },
    { label: "COMPLETE", limit: 100 },
  ];

  return (
    <motion.div
      initial={{ y: 200 }}
      animate={{ y: 0 }}
      className="absolute bottom-0 left-0 right-0 h-[190px] bg-[#05070A]/85 backdrop-blur-xl border-t border-[#00F5D4]/15 flex z-30"
    >
      {/* Visual Scan sweep on console background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,245,212,0.01)_50%,rgba(0,0,0,0)_50%)] bg-[size:100%_4px] pointer-events-none" />

      {/* Left Area: Spaceship Mission Log Timeline */}
      <div className="w-[340px] border-r border-[#00F5D4]/15 p-4 flex flex-col justify-between shrink-0 bg-[#05070A]/95 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-r from-transparent to-[#00F5D4]/2 pointer-events-none" />
        
        <div>
          <h2 className="text-[9px] font-bold text-[#4CC9F0] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
            <span className="size-1.5 bg-[#4CC9F0] rounded-full animate-pulse" />
            Mission Timeline
          </h2>

          <div className="space-y-2 mt-2">
            {steps.map((s, index) => {
              let state: "upcoming" | "active" | "done" = "upcoming";
              
              if (executionState.status === "success") {
                state = "done";
              } else if (executionState.status === "running") {
                if (executionState.progress >= s.limit) {
                  state = "done";
                } else if (executionState.progress >= (index > 0 ? steps[index - 1].limit : 0)) {
                  state = "active";
                }
              }

              return (
                <div key={s.label} className="flex items-center gap-3 text-[9px] font-mono">
                  <div className="w-16 text-jarvis-text-muted">STEP_0{index + 1}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <span 
                      className={`h-[1px] flex-1 border-t border-dashed ${
                        state === "done" ? "border-[#38F9A8]/40" 
                        : state === "active" ? "border-[#4CC9F0]/40 animate-pulse" 
                        : "border-jarvis-border/20"
                      }`}
                    />
                    <span 
                      className={`font-bold tracking-widest px-2 py-0.5 rounded-sm border ${
                        state === "done" ? "text-[#38F9A8] border-[#38F9A8]/30 bg-[#38F9A8]/5" 
                        : state === "active" ? "text-[#4CC9F0] border-[#4CC9F0]/40 bg-[#4CC9F0]/10 animate-pulse" 
                        : "text-jarvis-text-muted/40 border-transparent"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Execution Mode Indicator */}
        <div className="text-[8px] text-jarvis-text-muted border-t border-jarvis-border/20 pt-2 flex items-center justify-between font-mono">
          <span>RUN_MODE: {executionState.status.toUpperCase()}</span>
          <span>PROGRESS: {executionState.progress}%</span>
        </div>
      </div>

      {/* Right Area: Real-Time Streaming Logs */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-8 border-b border-jarvis-border/30 flex items-center justify-between px-4 shrink-0 bg-black/20">
          <h2 className="text-[9px] font-bold text-[#00F5D4] uppercase tracking-[0.25em] flex items-center gap-2">
            <Terminal className="size-3 text-[#00F5D4]" />
            Live Event Stream
          </h2>
          {executionState.status === "running" && (
            <div className="flex items-center gap-1.5 text-[8px] text-[#4CC9F0] font-mono animate-pulse">
              <Loader2 className="size-2.5 animate-spin" />
              <span>CORE_BUSY</span>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-4 bg-black/10">
          <div className="space-y-1.5 font-mono text-[10px]">
            {executionState.logs.length === 0 ? (
              <div className="h-28 flex items-center justify-center text-[9px] uppercase tracking-widest text-jarvis-text-muted/40">
                SYSTEM STANDBY // NO DIRECTIVE EXECUTING
              </div>
            ) : (
              executionState.logs.map((log) => {
                const time = new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false });
                const isError = log.level === "error";
                const isSuccess = log.level === "success";

                return (
                  <div key={log.id} className={`flex items-start gap-3 border-l-2 pl-2 ${
                    isError ? "border-[#FF5C8A] text-[#FF5C8A]/90 bg-[#FF5C8A]/5" 
                    : isSuccess ? "border-[#38F9A8] text-[#38F9A8]/90" 
                    : "border-[#4CC9F0]/30 text-jarvis-text/80"
                  } py-0.5 rounded-r`}>
                    <span className="text-[9px] text-jarvis-text-muted shrink-0">{time}</span>
                    <span className="font-semibold uppercase text-[8px] tracking-wider shrink-0">
                      [{log.level}]
                    </span>
                    <span className="flex-1 break-all leading-relaxed">{log.message}</span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}
