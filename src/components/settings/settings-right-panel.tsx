"use client";

import { motion } from "framer-motion";
import { Info, HelpCircle } from "lucide-react";
import type { SettingsState } from "@/lib/settings/use-settings";

interface RightPanelProps {
  state: SettingsState;
}

const CATEGORY_HELP: Record<string, { title: string, description: string, tips: string[] }> = {
  appearance: {
    title: "Appearance",
    description: "Customize the look and feel of the JARVIS Operating System.",
    tips: ["Use 'System Match' to automatically sync with your OS preferences.", "Turn on 'Reduced Motion' if you experience performance issues."]
  },
  profile: {
    title: "Profile",
    description: "Manage your personal information and localization settings.",
    tips: ["Time Zone affects when scheduled workflows and agents execute.", "Ensure your email is verified to receive workflow alerts."]
  },
  security: {
    title: "Security",
    description: "Configure system security, MFA, and session policies.",
    tips: ["Lower session timeouts increase security but require more frequent logins."]
  },
  storage: {
    title: "Storage",
    description: "Monitor and manage disk usage across the system.",
    tips: ["Clearing cache resolves most UI glitch issues safely without losing data."]
  },
  notifications: {
    title: "Notifications",
    description: "Control how and when the system alerts you of events.",
    tips: ["Email digests group alerts into a single daily summary.", "Turn off Scheduler alerts if you have many recurring jobs."]
  }
};

export function SettingsRightPanel({ state }: RightPanelProps) {
  const { activeCategory } = state;
  const help = CATEGORY_HELP[activeCategory] || {
    title: activeCategory,
    description: "Configure settings for this module.",
    tips: []
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[300px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
          <Info className="size-4 text-jarvis-primary" /> Context
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <section>
          <h3 className="text-sm font-bold text-jarvis-text mb-2 capitalize">{help.title}</h3>
          <p className="text-xs text-jarvis-text-muted leading-relaxed">
            {help.description}
          </p>
        </section>

        {help.tips.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <HelpCircle className="size-3" /> Tips
            </h3>
            <ul className="space-y-2">
              {help.tips.map((tip, i) => (
                <li key={i} className="text-xs text-jarvis-text-muted bg-jarvis-panel/20 p-2 rounded border border-jarvis-panel-border/30">
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </motion.div>
  );
}
