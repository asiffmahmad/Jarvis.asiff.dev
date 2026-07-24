"use client";

import { motion } from "framer-motion";
import type { PlatformsState } from "@/lib/platforms/use-platforms";

interface ToolbarProps {
  state: PlatformsState;
}

export function PlatformsToolbar({ state: _state }: ToolbarProps) {
  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      className="absolute bottom-0 left-0 right-0 h-16 border-t border-jarvis-panel/30 bg-jarvis-bg-deep/90 backdrop-blur-md z-30 flex items-center px-6 justify-between"
    >
      <span className="text-[10px] text-jarvis-text-muted font-mono">
        Configure platform API keys in your .env file to connect accounts
      </span>
    </motion.div>
  );
}
