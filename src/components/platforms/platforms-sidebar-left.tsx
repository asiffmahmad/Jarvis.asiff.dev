"use client";

import { motion } from "framer-motion";
import { Link2, Clock, Globe, ShieldCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { PlatformsState } from "@/lib/platforms/use-platforms";
import type { PlatformId } from "@/lib/platforms/types";

interface SidebarProps {
  state: PlatformsState;
}

// Minimal icon component since we don't have all brand icons in lucide
const BrandIcon = ({ platformId, color }: { platformId: PlatformId, color: string }) => {
  return (
    <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] text-white shadow-sm" style={{ backgroundColor: color }}>
      {platformId.charAt(0).toUpperCase()}
    </div>
  );
};

export function PlatformsSidebarLeft({ state }: SidebarProps) {
  const { providers, selectedProviderId, setSelectedProviderId, activeAccountId, accounts } = state;

  const connectedProviders = providers.filter(p => accounts.some(a => a.platformId === p.id));
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
          <Link2 className="size-5" /> Platforms
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          Integration Manager
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        
        {/* Connected */}
        {connectedProviders.length > 0 && (
          <div className="space-y-1 mb-6 mt-2">
            <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck className="size-3 text-[#34F5D0]" /> Active Connections
            </h3>
            {connectedProviders.map((provider) => {
              const isSelected = selectedProviderId === provider.id || (!selectedProviderId && activeAccountId && accounts.find(a => a.id === activeAccountId)?.platformId === provider.id);
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
                    <BrandIcon platformId={provider.id} color={provider.brandColor} />
                    <span className={cn("text-sm font-bold", isSelected ? "text-jarvis-primary" : "text-jarvis-text")}>{provider.name}</span>
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
              <Globe className="size-3" /> Available Providers
            </h3>
            {availableProviders.map((provider) => {
              const isSelected = selectedProviderId === provider.id;
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
                  <BrandIcon platformId={provider.id} color={provider.brandColor} />
                  <span className={cn("text-sm font-bold", isSelected ? "text-jarvis-primary" : "text-jarvis-text-muted group-hover:text-jarvis-text")}>{provider.name}</span>
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
            return (
              <div
                key={provider.id}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-transparent opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <BrandIcon platformId={provider.id} color={provider.brandColor} />
                  <span className="text-sm font-bold text-jarvis-text-muted">{provider.name}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-mono bg-jarvis-panel/50 px-1.5 py-0.5 rounded text-jarvis-text-muted/70">Coming Soon</span>
              </div>
            );
          })}
        </div>

      </ScrollArea>
    </motion.aside>
  );
}
