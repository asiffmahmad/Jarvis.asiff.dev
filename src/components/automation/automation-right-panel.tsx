"use client";

import { motion } from "framer-motion";
import { Info, Settings2, Terminal, Code2 } from "lucide-react";
import type { AutomationState } from "@/lib/automation/use-automation";

interface RightPanelProps {
  state: AutomationState;
}

export function AutomationRightPanel({ state }: RightPanelProps) {
  const { activeNode, logs } = state;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[300px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Inspector
        </h2>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Node Properties - Top Half */}
        <div className="flex-1 overflow-y-auto p-4 border-b border-jarvis-panel/30">
          {!activeNode ? (
            <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
              <Settings2 className="size-8 mb-2" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-center">Select node to configure</span>
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info className="size-3" /> Identity
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-jarvis-text-muted uppercase tracking-wider mb-1 block">Node ID</label>
                    <div className="bg-jarvis-panel/30 border border-jarvis-panel-border/30 rounded px-3 py-2 text-xs font-mono text-jarvis-text/70">{activeNode.id}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-jarvis-text-muted uppercase tracking-wider mb-1 block">Label</label>
                    <input 
                      type="text" 
                      value={activeNode.data.label} 
                      readOnly 
                      className="w-full bg-jarvis-panel/50 border border-jarvis-panel-border/50 rounded px-3 py-2 text-xs text-jarvis-text focus:outline-none focus:border-jarvis-primary/50"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Code2 className="size-3" /> Parameters
                </h3>
                <div className="text-xs text-jarvis-text-muted/50 italic p-4 text-center border border-dashed border-jarvis-panel-border/30 rounded-lg">
                  Specific configuration fields will load here based on node type.
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Execution Logs - Bottom Half */}
        <div className="h-1/3 flex flex-col bg-jarvis-panel/10">
          <div className="px-4 py-2 border-b border-jarvis-panel/30 flex items-center gap-2">
            <Terminal className="size-3 text-jarvis-text-muted" />
            <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Execution Trace</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {logs.length === 0 ? (
              <span className="text-[10px] font-mono text-jarvis-text-muted/50">Awaiting execution...</span>
            ) : (
              logs.map(log => (
                <div key={log.id} className="text-[10px] font-mono leading-relaxed">
                  <span className="text-jarvis-text-muted">[{log.timestamp.toLocaleTimeString()}]</span>{" "}
                  <span className={
                    log.status === 'error' ? 'text-[#FF4D4D]' : 
                    log.status === 'success' ? 'text-[#34F5D0]' : 
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
