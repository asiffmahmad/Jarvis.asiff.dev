"use client";

import { motion } from "framer-motion";
import { Settings2, CheckCircle2, XCircle } from "lucide-react";
import type { PlatformsState } from "@/lib/platforms/use-platforms";

interface RightPanelProps {
  state: PlatformsState;
}

export function PlatformsRightPanel({ state }: RightPanelProps) {
  const { activeProvider } = state;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[350px] h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col z-20"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Platform Details
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!activeProvider ? (
          <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
            <Settings2 className="size-8 mb-2" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-center">Select a Platform</span>
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3">
                Capabilities
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
          </div>
        )}
      </div>
    </motion.div>
  );
}
