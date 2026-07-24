"use client";

import { motion } from "framer-motion";
import { Network, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import type { IntegrationsState } from "@/lib/integrations/use-integrations";
import { cn } from "@/lib/utils";

interface CenterPanelProps {
  state: IntegrationsState;
}

export function IntegrationsCenterPanel({ state }: CenterPanelProps) {
  const { activeProvider, connections, activeConnectionId, setActiveConnectionId, isConnecting, isTesting } = state;

  if (!activeProvider) {
    return (
      <div className="flex-[2] flex flex-col items-center justify-center relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50 p-8">
        <Network className="size-16 mb-4 text-jarvis-text-muted opacity-50" />
        <h2 className="text-lg font-heading tracking-widest uppercase text-jarvis-text-muted opacity-50">No Integration Selected</h2>
      </div>
    );
  }

  const providerConnections = connections.filter(c => c.providerId === activeProvider.id);

  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50 p-8">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-black/50" style={{ backgroundColor: activeProvider.brandColor }}>
              {activeProvider.id.charAt(0).toUpperCase()}
            </div>
            {activeProvider.name} Service
          </h1>
          <p className="text-xs text-jarvis-text-muted uppercase tracking-widest mt-2 font-mono">
            Auth Type: {activeProvider.authType}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providerConnections.map(conn => (
          <motion.button
            key={conn.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setActiveConnectionId(conn.id)}
            className={cn(
              "p-6 rounded-xl border flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden",
              activeConnectionId === conn.id 
                ? "bg-jarvis-panel border-[#34F5D0] shadow-[0_0_30px_rgba(52,245,208,0.1)]"
                : "bg-jarvis-panel/50 border-jarvis-panel-border/50 hover:border-jarvis-primary/50"
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-b from-transparent opacity-20",
              conn.status === 'connected' ? "to-[#34F5D0]" :
              conn.status === 'error' ? "to-[#FF4D4D]" :
              "to-jarvis-primary"
            )} />

            <div className="w-16 h-16 rounded-full bg-jarvis-bg-deepest border-2 border-jarvis-panel-border mb-4 flex items-center justify-center relative z-10 shadow-lg">
              <Network className="size-8 text-jarvis-text" style={{ color: activeProvider.brandColor }} />
              
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-jarvis-bg border-2 border-jarvis-panel flex items-center justify-center">
                {conn.status === 'connected' && <ShieldCheck className="size-3 text-[#34F5D0]" />}
                {conn.status === 'error' && <AlertCircle className="size-3 text-[#FF4D4D]" />}
              </div>
            </div>
            
            <h3 className="font-bold text-jarvis-text relative z-10 font-mono text-sm uppercase">Active Node</h3>
            <p className="text-[10px] text-jarvis-text-muted relative z-10 font-mono mt-1">
              Last Ping: {conn.lastSync.toLocaleTimeString()}
            </p>
            
            {(isTesting && activeConnectionId === conn.id) && (
              <div className="absolute top-4 right-4">
                <Loader2 className="size-4 animate-spin text-[#34F5D0]" />
              </div>
            )}
          </motion.button>
        ))}

        {isConnecting && (
          <div className="p-6 rounded-xl border border-jarvis-panel-border border-dashed flex flex-col items-center justify-center bg-jarvis-panel/20 opacity-50 animate-pulse">
            <Loader2 className="size-8 animate-spin text-jarvis-text-muted mb-4" />
            <span className="text-xs font-mono uppercase tracking-widest text-jarvis-text-muted">Establishing Link...</span>
          </div>
        )}
      </div>

      {providerConnections.length === 0 && !isConnecting && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center max-w-sm">
            <p className="text-sm text-jarvis-text-muted mb-6">
              Connect to {activeProvider.name} to expose its capabilities to the JARVIS ecosystem.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
