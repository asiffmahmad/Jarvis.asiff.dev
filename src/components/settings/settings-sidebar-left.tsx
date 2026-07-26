"use client";

import { motion } from "framer-motion";
import { Settings, Palette, User, ShieldCheck, Database, Terminal, Keyboard, Bell, Cloud, Accessibility, Info, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SettingsState } from "@/lib/settings/use-settings";
import type { SettingsCategory } from "@/lib/settings/types";

interface SidebarProps {
  state: SettingsState;
}

const CATEGORIES: { id: SettingsCategory; label: string; icon: React.ElementType }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'storage', label: 'Storage', icon: Database },
];

export function SettingsSidebarLeft({ state }: SidebarProps) {
  const { activeCategory, setActiveCategory } = state;

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg flex items-center gap-2">
          <Settings className="size-5" /> Settings
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          System Configuration
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 mb-6 mt-2">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const Icon = cat.icon;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group text-left",
                  isSelected
                    ? "bg-jarvis-primary/10 border border-jarvis-primary/30 shadow-[inset_0_0_10px_rgba(52,245,208,0.1)]"
                    : "hover:bg-jarvis-panel/50 border border-transparent"
                )}
              >
                <Icon className={cn("size-4", isSelected ? "text-jarvis-primary drop-shadow-[0_0_6px_rgba(52,245,208,0.4)]" : "text-jarvis-text-muted group-hover:text-jarvis-text")} />
                <span className={cn("text-sm font-bold", isSelected ? "text-jarvis-primary" : "text-jarvis-text")}>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
