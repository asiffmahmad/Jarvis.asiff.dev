"use client";

import { motion } from "framer-motion";
import { Link2, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { PlatformsState } from "@/lib/platforms/use-platforms";
import type { PlatformId } from "@/lib/platforms/types";

interface SidebarProps {
  state: PlatformsState;
}

const BrandIcon = ({ platformId, color }: { platformId: PlatformId, color: string }) => (
  <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] text-white shadow-sm" style={{ backgroundColor: color }}>
    {platformId.charAt(0).toUpperCase()}
  </div>
);

export function PlatformsSidebarLeft({ state }: SidebarProps) {
  const { providers, selectedProviderId, setSelectedProviderId } = state;

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
          Social Media Connections
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 mt-2">
          {providers.map((provider) => {
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
      </ScrollArea>
    </motion.aside>
  );
}
