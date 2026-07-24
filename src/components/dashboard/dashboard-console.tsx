"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DashboardConsole() {
  return (
    <motion.div
      initial={{ y: 200 }}
      animate={{ y: 0 }}
      className="absolute bottom-0 left-[260px] right-[300px] h-[180px] bg-jarvis-bg-deepest/90 backdrop-blur-xl border-t border-jarvis-panel/50 flex flex-col z-30"
    >
      <div className="h-8 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0">
        <h2 className="text-[10px] font-mono font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
          <Terminal className="size-3 text-jarvis-primary" /> Live Event Stream
        </h2>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="h-full flex items-center justify-center text-[10px] font-mono text-jarvis-text-muted/50">
          System monitoring idle. Events will appear here during agent execution.
        </div>
      </ScrollArea>
    </motion.div>
  );
}
