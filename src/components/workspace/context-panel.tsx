"use client";

import { Activity, Brain, Server, Cpu, Clock, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function WorkspaceContextPanel() {
  return (
    <div className="w-[280px] h-full hidden lg:flex flex-col border-l border-jarvis-border bg-jarvis-bg-deepest/95 backdrop-blur-xl shrink-0">
      <div className="p-4 border-b border-jarvis-border">
        <h2 className="font-heading text-xs tracking-widest uppercase text-jarvis-text-muted flex items-center gap-2">
          <Activity className="size-3.5 text-jarvis-primary" /> System Telemetry
        </h2>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 py-4">
          
          {/* Active Model */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <Brain className="size-3 text-jarvis-primary" /> Active Core
            </h3>
            <div className="p-3 rounded-[8px] bg-jarvis-panel/30 border border-jarvis-primary/20 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Brain className="size-16" />
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-jarvis-primary font-mono mb-1 block">Groq</span>
                <p className="text-sm font-medium text-jarvis-text">Llama 3 70B</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-jarvis-success shadow-[0_0_8px_rgba(66,255,152,0.8)] animate-pulse" />
                  <span className="text-[9px] font-mono text-jarvis-success uppercase tracking-wider">Online & Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="size-3 text-jarvis-warning" /> Session Metrics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <StatCard icon={<Cpu />} label="Tokens" value="1.2k" />
              <StatCard icon={<Clock />} label="Duration" value="12m" />
              <StatCard icon={<Server />} label="Memory" value="45%" />
              <StatCard icon={<Activity />} label="Latency" value="120ms" />
            </div>
          </div>

          {/* Context Window */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <Server className="size-3 text-jarvis-accent" /> Context Window
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-jarvis-text-muted">
                <span>Usage</span>
                <span className="text-jarvis-text">15%</span>
              </div>
              <div className="h-1.5 bg-jarvis-panel rounded-full overflow-hidden">
                <div className="h-full bg-jarvis-accent w-[15%] rounded-full shadow-[0_0_10px_rgba(138,92,255,0.6)]" />
              </div>
              <p className="text-[9px] text-jarvis-text-muted font-mono text-right">
                1,240 / 8,192 tokens
              </p>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-[8px] bg-jarvis-panel/20 border border-jarvis-border/50 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-jarvis-text-muted">
        <div className="size-3 *:size-full">{icon}</div>
        <span className="text-[9px] uppercase tracking-widest">{label}</span>
      </div>
      <span className="font-mono text-xs text-jarvis-text">{value}</span>
    </div>
  );
}
