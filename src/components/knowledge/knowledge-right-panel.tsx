"use client";

import { motion } from "framer-motion";
import { Info, Tag as TagIcon, Link as LinkIcon, Activity } from "lucide-react";
import type { KnowledgeState } from "@/lib/knowledge/use-knowledge";

interface RightPanelProps {
  state: KnowledgeState;
}

export function KnowledgeRightPanel({ state }: RightPanelProps) {
  const { activeItem, tags } = state;

  if (!activeItem) {
    return (
      <div className="flex-1 h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col items-center justify-center text-jarvis-text-muted">
        <Info className="size-8 opacity-20 mb-2" />
        <span className="text-[10px] uppercase font-mono tracking-widest">Select an item to view metadata</span>
      </div>
    );
  }

  const itemTags = tags.filter(t => activeItem.tags.includes(t.id));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 h-full bg-jarvis-bg-deepest border-l border-jarvis-panel/50 flex flex-col"
    >
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 z-10 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Inspector
        </h2>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Properties */}
        <section>
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Info className="size-3" /> Properties
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-jarvis-text-muted">Type</span>
              <span className="text-jarvis-text font-mono">{activeItem.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-jarvis-text-muted">Created</span>
              <span className="text-jarvis-text">{activeItem.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-jarvis-text-muted">Updated</span>
              <span className="text-jarvis-text">{activeItem.updatedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-jarvis-text-muted">Words</span>
              <span className="text-jarvis-text">{activeItem.content.split(/\s+/).length}</span>
            </div>
          </div>
        </section>

        {/* Tags */}
        <section>
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <TagIcon className="size-3" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {itemTags.length === 0 ? (
              <span className="text-xs text-jarvis-text-muted/50 italic">No tags assigned</span>
            ) : (
              itemTags.map(t => (
                <span key={t.id} className="flex items-center gap-1 text-[10px] text-jarvis-text bg-jarvis-panel/30 border border-jarvis-panel-border/50 px-2 py-1 rounded">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: t.color }} /> {t.name}
                </span>
              ))
            )}
          </div>
        </section>

        {/* Links */}
        <section>
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <LinkIcon className="size-3" /> Linked Graph
          </h3>
          <div className="text-xs text-jarvis-text-muted/50 italic p-4 text-center border border-dashed border-jarvis-panel-border/30 rounded-lg">
            No active connections found
          </div>
        </section>

        {/* Activity */}
        <section>
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity className="size-3" /> Timeline
          </h3>
          <div className="relative pl-3 border-l-2 border-jarvis-panel/30 space-y-4">
            <div className="relative">
              <div className="absolute -left-[17px] top-1 size-2 rounded-full bg-jarvis-primary shadow-[0_0_8px_rgba(52,245,208,0.5)]" />
              <p className="text-xs text-jarvis-text">Edited Document</p>
              <p className="text-[10px] text-jarvis-text-muted font-mono">{activeItem.updatedAt.toLocaleTimeString()}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[17px] top-1 size-2 rounded-full bg-jarvis-panel-border" />
              <p className="text-xs text-jarvis-text-muted">Created item</p>
              <p className="text-[10px] text-jarvis-text-muted font-mono">{activeItem.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
