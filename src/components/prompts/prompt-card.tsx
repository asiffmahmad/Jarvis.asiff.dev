"use client";

import { motion } from "framer-motion";
import { Star, Clock, Copy, Tag } from "lucide-react";
import type { Prompt } from "@/lib/prompts/types";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  prompt: Prompt;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export function PromptCard({ prompt, isSelected, onSelect, onToggleFavorite }: PromptCardProps) {
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
        "border glass-strong p-4 flex flex-col gap-3 min-h-[160px]",
        isSelected
          ? "border-jarvis-primary bg-jarvis-panel/60 shadow-[0_0_30px_rgba(52,245,208,0.15)]"
          : "border-jarvis-panel-border hover:border-jarvis-primary/50 bg-jarvis-panel/30 hover:bg-jarvis-panel/50 hover:shadow-[0_0_20px_rgba(52,245,208,0.05)]"
      )}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-heading font-semibold text-jarvis-text text-sm line-clamp-2 pr-6">
          {prompt.title}
        </h3>
        <button
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-jarvis-bg-deep/50 transition-colors z-10"
        >
          <Star 
            className={cn("size-4 transition-colors", prompt.isFavorite ? "fill-jarvis-accent text-jarvis-accent" : "text-jarvis-text-muted hover:text-jarvis-accent/50")} 
          />
        </button>
      </div>

      <p className="text-xs text-jarvis-text-muted line-clamp-2 flex-1">
        {prompt.description || "No description provided."}
      </p>

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-jarvis-panel-border/30">
        <div className="flex-1 flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/20">
            <Tag className="size-3" />
            {prompt.category}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-jarvis-text-muted">
          <span className="flex items-center gap-1" title="Times Used">
            <Copy className="size-3" />
            {prompt.timesUsed}
          </span>
          <span className="flex items-center gap-1" title="Average Response Time">
            <Clock className="size-3" />
            {(prompt.averageResponseTimeMs / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
    </motion.div>
  );
}
