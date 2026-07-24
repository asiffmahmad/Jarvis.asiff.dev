"use client";

import { motion } from "framer-motion";
import { Network, Server, Cpu, Clock, Box, ShieldCheck, Mail, Database } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { IntegrationsState } from "@/lib/integrations/use-integrations";
import type { ProviderCategory } from "@/lib/integrations/types";

interface SidebarProps {
  state: IntegrationsState;
}

const getCategoryIcon = (category: ProviderCategory) => {
  switch (category) {
    case 'ai': return Cpu;
    case 'productivity': return Box;
    case 'developer': return Server;
    case 'communication': return Mail;
    case 'storage': return Database;
    default: return Network;
  }
};

export function IntegrationsSidebarLeft({ state }: SidebarProps) {
  const { providers, selectedProviderId, setSelectedProviderId, activeConnectionId, connections } = state;

  const connectedProviders = providers.filter(p => connections.some(c => c.providerId === p.id));
  const availableProviders = providers.filter(p => p.isAvailable && !connectedProviders.find(cp => cp.id === p.id));
  const futureProviders = providers.filter(p => !p.isAvailable);

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg flex items-center gap-2">
          <Network className="size-5" /> Hub
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          External Services
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        
        {/* Connected */}
        {connectedProviders.length > 0 && (
          <div className="space-y-1 mb-6 mt-2">
            <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck className="size-3 text-[#34F5D0]" /> Connected Services
            </h3>
            {connectedProviders.map((provider) => {
              const isSelected = selectedProviderId === provider.id || (!selectedProviderId && activeConnectionId && connections.find(c => c.id === activeConnectionId)?.providerId === provider.id);
              const CatIcon = getCategoryIcon(provider.category);
              
              return (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProviderId(provider.id)}
                  className={cn(
                    "w-full flex flex-col gap-1 p-3 rounded-lg transition-all duration-300 group text-left",
                    isSelected
                      ? "bg-jarvis-primary/10 border border-jarvis-primary/30 shadow-[inset_0_0_10px_rgba(52,245,208,0.1)]"
                      : "hover:bg-jarvis-panel/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] text-white shadow-sm" style={{ backgroundColor: provider.brandColor }}>
                      {provider.id.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className={cn("text-sm font-bold leading-tight", isSelected ? "text-jarvis-primary" : "text-jarvis-text")}>{provider.name}</span>
                      <span className="text-[9px] uppercase tracking-widest font-mono text-jarvis-text-muted flex items-center gap-1">
                        <CatIcon className="size-2" /> {provider.category}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Available */}
        {availableProviders.length > 0 && (
          <div className="space-y-1 mb-6 mt-2">
            <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
              <Server className="size-3" /> Available Integrations
            </h3>
            {availableProviders.map((provider) => {
              const isSelected = selectedProviderId === provider.id;
              const CatIcon = getCategoryIcon(provider.category);
              return (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProviderId(provider.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group text-left",
                    isSelected
                      ? "bg-jarvis-primary/10 border border-jarvis-primary/30"
                      : "hover:bg-jarvis-panel/50 border border-transparent"
                  )}
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] text-white opacity-70 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: provider.brandColor }}>
                    {provider.id.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-sm font-bold leading-tight", isSelected ? "text-jarvis-primary" : "text-jarvis-text-muted group-hover:text-jarvis-text")}>{provider.name}</span>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-jarvis-text-muted/50 flex items-center gap-1">
                      <CatIcon className="size-2" /> {provider.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Future */}
        <div className="space-y-1">
          <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <Clock className="size-3" /> Future Architecture
          </h3>
          {futureProviders.map((provider) => {
            const CatIcon = getCategoryIcon(provider.category);
            return (
              <div
                key={provider.id}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-transparent opacity-40 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] text-white" style={{ backgroundColor: provider.brandColor }}>
                    {provider.id.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-jarvis-text-muted leading-tight">{provider.name}</span>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-jarvis-text-muted/50 flex items-center gap-1">
                      <CatIcon className="size-2" /> {provider.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </ScrollArea>
    </motion.aside>
  );
}
