"use client";

import { motion } from "framer-motion";
import { Terminal, Settings2, Code, Shield } from "lucide-react";
import type { AgentsState } from "@/lib/agents/use-agents";

interface RightPanelProps {
  state: AgentsState;
}

export function AgentsRightPanel({ state }: RightPanelProps) {
  const { activeAgent, executionState } = state;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[350px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Context & Inspector
        </h2>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Agent Metadata */}
        <div className="flex-[2] overflow-y-auto p-4 border-b border-jarvis-panel/30">
          {!activeAgent ? (
            <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
              <Settings2 className="size-8 mb-2" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-center">Awaiting Agent Selection</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              <section>
                <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Shield className="size-3" /> Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeAgent.capabilities.map(cap => (
                    <span key={cap} className="px-2 py-1 rounded bg-jarvis-panel/50 border border-jarvis-panel-border/30 text-[10px] text-jarvis-text uppercase tracking-wider font-mono">
                      {cap}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Code className="size-3" /> Context Payload
                </h3>
                <div className="bg-jarvis-bg/50 border border-jarvis-panel-border/30 rounded p-3 text-[10px] font-mono text-jarvis-text/70 whitespace-pre overflow-x-auto">
                  {JSON.stringify({
                    context: "Shared Agent Context",
                    tools_available: "INTERNAL_ONLY",
                    mcp_servers: []
                  }, null, 2)}
                </div>
              </section>

              {executionState.result && (
                <section>
                  <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Code className="size-3 text-[#34F5D0]" /> Execution Output
                  </h3>
                  <div className="bg-[#34F5D0]/5 border border-[#34F5D0]/30 rounded p-3 text-[10px] font-mono text-[#34F5D0] whitespace-pre overflow-x-auto">
                    {executionState.result}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>

        {/* Execution Logs Terminal */}
        <div className="flex-1 flex flex-col bg-[#050B14]">
          <div className="px-4 py-2 border-b border-jarvis-panel/30 flex items-center gap-2 bg-jarvis-panel/20">
            <Terminal className="size-3 text-jarvis-text-muted" />
            <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Execution Trace</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {executionState.logs.length === 0 ? (
              <span className="text-[10px] font-mono text-jarvis-text-muted/50">System ready...</span>
            ) : (
              executionState.logs.map(log => (
                <div key={log.id} className="text-[10px] font-mono leading-relaxed">
                  <span className="text-jarvis-text-muted/50">[{log.timestamp.toLocaleTimeString()}]</span>{" "}
                  <span className={
                    log.level === 'error' ? 'text-[#FF4D4D]' : 
                    log.level === 'success' ? 'text-[#34F5D0]' : 
                    log.level === 'warn' ? 'text-[#F5A623]' : 
                    'text-jarvis-text/80'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
