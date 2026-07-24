"use client";

import { motion } from "framer-motion";
import { Save, Copy, Trash2, Download, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptState } from "@/lib/prompts/use-prompts";

interface PromptsToolbarProps {
  promptState: PromptState;
}

export function PromptsToolbar({ promptState }: PromptsToolbarProps) {
  const { activePrompt, deletePrompt, duplicatePrompt } = promptState;

  if (!activePrompt) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn(
        "absolute bottom-6 left-1/2 -translate-x-1/2 z-30",
        "flex items-center gap-2 px-4 py-3 rounded-full",
        "bg-jarvis-panel/80 backdrop-blur-xl border border-jarvis-primary/30",
        "shadow-[0_0_30px_rgba(52,245,208,0.15)]"
      )}
    >
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-jarvis-primary/10 text-jarvis-text hover:text-jarvis-primary transition-colors text-sm font-medium"
        >
          <Save className="size-4" /> Save
        </button>
        
        <div className="w-px h-4 bg-jarvis-panel-border" />
        
        <button
          onClick={() => duplicatePrompt(activePrompt.id)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-jarvis-primary/10 text-jarvis-text hover:text-jarvis-primary transition-colors text-sm font-medium"
        >
          <Copy className="size-4" /> Duplicate
        </button>

        <div className="w-px h-4 bg-jarvis-panel-border" />
        
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this prompt?")) {
              deletePrompt(activePrompt.id);
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-jarvis-danger/10 text-jarvis-text hover:text-jarvis-danger transition-colors text-sm font-medium"
        >
          <Trash2 className="size-4" /> Delete
        </button>

        <div className="w-px h-4 bg-jarvis-panel-border" />

        <button
          className="p-1.5 rounded-full hover:bg-jarvis-primary/10 text-jarvis-text-muted hover:text-jarvis-primary transition-colors"
          title="Export YAML"
        >
          <Download className="size-4" />
        </button>
      </div>

      <div className="ml-2 pl-4 border-l border-jarvis-panel-border flex items-center gap-2">
        <kbd className="flex items-center gap-1 rounded bg-jarvis-bg-deepest px-2 py-1 text-[10px] text-jarvis-text-muted border border-jarvis-panel-border font-mono">
          <Command className="size-3" /> S
        </kbd>
      </div>
    </motion.div>
  );
}
