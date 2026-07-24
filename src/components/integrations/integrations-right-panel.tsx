"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Settings2, Key, CheckCircle2, ShieldAlert } from "lucide-react";
import type { IntegrationsState } from "@/lib/integrations/use-integrations";

interface RightPanelProps {
  state: IntegrationsState;
}

export function IntegrationsRightPanel({ state }: RightPanelProps) {
  const { activeConnection, activeProvider, logs, connectIntegration } = state;
  const [apiKey, setApiKey] = useState("");

  const needsAuth = activeProvider && !activeConnection && activeProvider.authType === 'apikey';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[350px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Node Inspector
        </h2>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        <div className="flex-[2] overflow-y-auto p-4 border-b border-jarvis-panel/30">
          {!activeProvider ? (
            <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
              <Settings2 className="size-8 mb-2" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-center">Awaiting Integration</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* API Key Configuration Form (when not connected) */}
              {needsAuth && (
                <section>
                  <h3 className="text-[10px] font-bold text-[#F5A623] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldAlert className="size-3" /> Requires Authentication
                  </h3>
                  <div className="p-3 bg-jarvis-panel/30 border border-jarvis-panel-border/30 rounded flex flex-col gap-3">
                    <label className="text-[10px] uppercase font-mono text-jarvis-text-muted">Secret Key</label>
                    <input 
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-jarvis-bg border border-jarvis-panel-border rounded px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary font-mono"
                    />
                    <button
                      onClick={() => connectIntegration && connectIntegration(activeProvider.id, apiKey)}
                      disabled={!apiKey}
                      className="w-full py-2 rounded bg-jarvis-panel hover:bg-jarvis-panel-border text-[10px] font-bold uppercase tracking-widest text-jarvis-text transition-colors disabled:opacity-50"
                    >
                      Store & Connect
                    </button>
                  </div>
                </section>
              )}

              {/* Discovery Metadata */}
              <section>
                <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Key className="size-3" /> Exposed Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeProvider.capabilities).filter(([_, v]) => v).map(([key]) => (
                    <span key={key} className="px-2 py-1 rounded bg-jarvis-panel/50 border border-jarvis-panel-border/30 text-[10px] text-jarvis-text uppercase tracking-wider font-mono flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-[#34F5D0]" />
                      {key}
                    </span>
                  ))}
                </div>
              </section>

              {/* Dynamic Connection Metadata */}
              {activeConnection?.metadata && (
                <section>
                  <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Settings2 className="size-3" /> Runtime Context
                  </h3>
                  <div className="bg-jarvis-bg/50 border border-jarvis-panel-border/30 rounded p-3 text-[10px] font-mono text-jarvis-text/70 whitespace-pre overflow-x-auto">
                    {JSON.stringify(activeConnection.metadata, null, 2)}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>

        {/* Logs */}
        <div className="flex-1 flex flex-col bg-[#050B14]">
          <div className="px-4 py-2 border-b border-jarvis-panel/30 flex items-center gap-2 bg-jarvis-panel/20">
            <Terminal className="size-3 text-jarvis-text-muted" />
            <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Syslog</span>
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
