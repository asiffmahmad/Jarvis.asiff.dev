"use client";

import { motion } from "framer-motion";
import { Terminal, Settings2, Key, CheckCircle2, XCircle } from "lucide-react";
import type { PlatformsState } from "@/lib/platforms/use-platforms";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  state: PlatformsState;
}

export function PlatformsRightPanel({ state }: RightPanelProps) {
  const { activeAccount, activeProvider, logs } = state;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[350px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Platform Inspector
        </h2>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Account Details */}
        <div className="flex-[2] overflow-y-auto p-4 border-b border-jarvis-panel/30">
          {!activeProvider ? (
            <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
              <Settings2 className="size-8 mb-2" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-center">Awaiting Selection</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              <section>
                <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Key className="size-3" /> API Capabilities
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(activeProvider.capabilities).map(([key, isSupported]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded bg-jarvis-panel/30 border border-jarvis-panel-border/30">
                      <span className="text-[10px] font-mono uppercase text-jarvis-text">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {isSupported ? (
                        <CheckCircle2 className="size-3 text-[#34F5D0]" />
                      ) : (
                        <XCircle className="size-3 text-jarvis-text-muted opacity-50" />
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {activeAccount && (
                <section>
                  <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3">
                    Sync Status
                  </h3>
                  <div className="p-3 bg-jarvis-panel/30 border border-jarvis-panel-border/30 rounded flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase text-jarvis-text-muted">Status</span>
                      <span className={cn("text-[10px] font-bold uppercase", activeAccount.status === 'connected' ? "text-[#34F5D0]" : "text-[#FF4D4D]")}>
                        {activeAccount.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase text-jarvis-text-muted">Last Sync</span>
                      <span className="text-[10px] font-mono text-jarvis-text">
                        {activeAccount.lastSync.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </section>
              )}

            </div>
          )}
        </div>

        {/* Sync Logs */}
        <div className="flex-1 flex flex-col bg-[#050B14]">
          <div className="px-4 py-2 border-b border-jarvis-panel/30 flex items-center gap-2 bg-jarvis-panel/20">
            <Terminal className="size-3 text-jarvis-text-muted" />
            <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Audit Trace</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {logs.length === 0 ? (
              <span className="text-[10px] font-mono text-jarvis-text-muted/50">Listening...</span>
            ) : (
              logs.map(log => (
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
