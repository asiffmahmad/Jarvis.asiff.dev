"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info, Database, Zap, Cpu, Terminal, Compass, BarChart } from "lucide-react";
import type { AgentsState } from "@/lib/agents/use-agents";

interface RightPanelProps {
  selectedAgent: string | null;
  agentsState: AgentsState;
}

export function DashboardRightPanel({ selectedAgent, agentsState }: RightPanelProps) {
  const { executionState, activeAgentId } = agentsState;
  const [agentData, setAgentData] = useState<{
    id: string;
    name: string;
    description: string;
    systemPrompt?: string;
    model?: string;
    apiProvider?: string;
    usageLeft?: number;
    isActive?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!selectedAgent) return;
    
    async function loadAgent() {
      try {
        const res = await fetch("/api/agents/registry");
        if (res.ok) {
          const allAgents = await res.json();
          // Match selected agent ID
          const normalizedId = selectedAgent!.replace("-", "_");
          const found = allAgents.find((a: { id: string }) => a.id === normalizedId || a.id === selectedAgent);
          setAgentData(found || null);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadAgent();
  }, [selectedAgent]);

  // Derive execution matching details
  const isExecutingCurrent = selectedAgent === activeAgentId && executionState.status === "running";
  const completedCurrent = selectedAgent === activeAgentId && executionState.status === "success";

  if (!selectedAgent) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[320px] h-full bg-[#05070A]/85 border-l border-[#00F5D4]/15 flex flex-col z-20 p-8 items-center justify-center text-center relative"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,245,212,0.01)_50%,rgba(0,0,0,0)_50%)] bg-[size:100%_4px] pointer-events-none" />
        <Compass className="size-8 text-jarvis-text-muted/30 mb-4 animate-spin" style={{ animationDuration: "12s" }} />
        <h3 className="text-[10px] font-bold text-jarvis-text uppercase tracking-widest mb-1.5">No Active Inspector</h3>
        <p className="text-[10px] text-jarvis-text-muted leading-relaxed font-mono">
          Select any agent node orbiting the synaptic core to connect the diagnostic inspector link.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[320px] h-full bg-[#05070A]/85 border-l border-[#00F5D4]/15 flex flex-col z-20 relative font-mono text-xs"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,245,212,0.01)_50%,rgba(0,0,0,0)_50%)] bg-[size:100%_4px] pointer-events-none" />

      {/* Header */}
      <div className="h-16 border-b border-[#00F5D4]/15 flex items-center justify-between px-6 shrink-0 bg-black/20 z-10">
        <h2 className="text-[10px] font-bold text-[#00F5D4] uppercase tracking-[0.25em] flex items-center gap-2">
          <Terminal className="size-3.5 text-[#00F5D4]" /> Diagnostic Link
        </h2>
        <span className="text-[8px] text-[#4CC9F0] border border-[#4CC9F0]/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest animate-pulse">
          {isExecutingCurrent ? "SYNCING" : "CONNECTED"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
        
        {/* Profile Card */}
        <div className="p-4 rounded-xl border border-jarvis-border/25 bg-black/35 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-1 bg-[#00F5D4]/40" />
          <h3 className="text-[11px] font-bold text-jarvis-text uppercase tracking-widest">
            {agentData?.name || selectedAgent.replace("agent-", "")}
          </h3>
          <p className="text-[10px] text-jarvis-text-muted mt-2 leading-relaxed">
            {agentData?.description || "Awaiting database profile information..."}
          </p>

          <div className="flex items-center gap-3 mt-4 text-[9px] border-t border-jarvis-border/20 pt-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase">
              <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Core Online
            </span>
            <span className="text-jarvis-text-muted">|</span>
            <span className="text-jarvis-text-muted">PROVIDER: {agentData?.apiProvider?.toUpperCase() || "SYSTEM"}</span>
          </div>
        </div>

        {/* Model Spec */}
        <section className="space-y-3">
          <h3 className="text-[9px] font-bold text-jarvis-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
            <Cpu className="size-3 text-[#4CC9F0]" /> Core Intelligence Specification
          </h3>
          <div className="p-3 bg-black/25 rounded-lg border border-jarvis-border/20 space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-jarvis-border/10 pb-1.5">
              <span className="text-jarvis-text-muted">Model ID:</span>
              <span className="text-jarvis-text font-bold">{agentData?.model || "google/gemma-2-27b-it"}</span>
            </div>
            <div className="flex justify-between border-b border-jarvis-border/10 pb-1.5">
              <span className="text-jarvis-text-muted">Allocated Tokens:</span>
              <span className="text-[#FFC857] font-bold">{agentData?.usageLeft ?? 1000} API_UNITS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-jarvis-text-muted">Temp Ratio:</span>
              <span className="text-[#4CC9F0] font-bold">0.70 (Standard)</span>
            </div>
          </div>
        </section>

        {/* Tool capabilities */}
        <section className="space-y-3">
          <h3 className="text-[9px] font-bold text-jarvis-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap className="size-3 text-[#FFC857]" /> Synaptic Tool Registries
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {["read_db", "write_db", "fetch_gmail", "analyze_spend", "roast_user", "nvidia_inference"].map(tool => (
              <span key={tool} className="px-2 py-0.5 bg-black/40 border border-jarvis-border/40 rounded text-[8px] text-jarvis-text-muted hover:border-[#FFC857]/40 hover:text-jarvis-text transition-colors">
                {tool}
              </span>
            ))}
          </div>
        </section>

        {/* System Prompt Instructions */}
        <section className="space-y-3">
          <h3 className="text-[9px] font-bold text-jarvis-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
            <Database className="size-3 text-[#B200FF]" /> Prompt Declarations
          </h3>
          <div className="p-3 bg-black/45 rounded-lg border border-jarvis-border/20 max-h-32 overflow-y-auto text-[9px] text-jarvis-text-muted/80 leading-relaxed scrollbar-thin">
            {agentData?.systemPrompt || "Loading system instruction declarations..."}
          </div>
        </section>

        {/* Live Execution Output Diagnostic */}
        {(isExecutingCurrent || completedCurrent) && (
          <section className="space-y-3 pt-2 border-t border-jarvis-border/20">
            <h3 className="text-[9px] font-bold text-[#38F9A8] uppercase tracking-[0.2em] flex items-center gap-2">
              <BarChart className="size-3 text-[#38F9A8]" /> Stream Diagnostics
            </h3>
            <div className="p-3 bg-[#38F9A8]/5 border border-[#38F9A8]/20 rounded-lg text-[9px] space-y-1 text-[#38F9A8]/90">
              <div className="flex justify-between">
                <span>STABILITY:</span>
                <span className="font-bold">100% NOMINAL</span>
              </div>
              <div className="flex justify-between">
                <span>LATENCY:</span>
                <span className="font-bold">128ms</span>
              </div>
              {completedCurrent && (
                <div className="mt-2 pt-2 border-t border-[#38F9A8]/20 text-[9px] text-jarvis-text">
                  <span className="font-bold block uppercase text-[#38F9A8] text-[8px] tracking-widest mb-1">Execution Output:</span>
                  <div className="max-h-24 overflow-y-auto text-jarvis-text-muted break-words leading-relaxed font-mono">
                    {executionState.result}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </motion.div>
  );
}
