"use client";

import { motion } from "framer-motion";
import { Search, Clock, Tag } from "lucide-react";
import type { ResearchState } from "@/lib/research/use-research";
import { cn } from "@/lib/utils";

interface CenterPanelProps {
  state: ResearchState;
}

export function ResearchCenterPanel({ state }: CenterPanelProps) {
  const { articles, selectedArticleId, setSelectedArticleId, searchQuery, setSearchQuery, selectedCategory } = state;

  return (
    <div className="flex-[1.5] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      
      {/* Header & Search */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-6 shrink-0 z-10 backdrop-blur-md gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-jarvis-text-muted" />
          <input 
            type="text" 
            placeholder="Search research..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-jarvis-panel/30 border border-jarvis-panel-border/50 rounded-full pl-10 pr-4 py-1.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/50 transition-colors"
          />
        </div>
        <div className="text-xs font-mono text-jarvis-text-muted bg-jarvis-panel/30 px-2 py-1 rounded border border-jarvis-panel-border/30">
          {articles.length} items
        </div>
      </div>

      {/* Article List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {articles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
            <Search className="size-8 mb-2" />
            <span className="font-heading uppercase tracking-widest text-xs">No articles found</span>
          </div>
        ) : (
          articles.map(article => (
            <motion.div
              key={article.id}
              layoutId={article.id}
              onClick={() => setSelectedArticleId(article.id)}
              className={cn(
                "p-4 rounded-xl cursor-pointer transition-all border",
                selectedArticleId === article.id 
                  ? "bg-jarvis-panel/30 border-jarvis-primary shadow-[0_0_15px_rgba(52,245,208,0.05)]" 
                  : "bg-jarvis-panel/10 border-jarvis-panel-border/30 hover:bg-jarvis-panel/20 hover:border-jarvis-panel-border"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] text-jarvis-primary border border-jarvis-primary/30 bg-jarvis-primary/10 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">
                  {article.feedTitle}
                </span>
                <span className="text-[10px] text-jarvis-text-muted flex items-center gap-1">
                  <Clock className="size-3" /> {article.readingTimeMin} min read
                </span>
              </div>
              
              <h3 className="font-bold text-jarvis-text text-lg mb-1 leading-tight">{article.title}</h3>
              <p className="text-xs text-jarvis-text-muted line-clamp-2 mb-3">{article.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[9px] text-jarvis-text/60 bg-jarvis-panel/30 px-1.5 py-0.5 rounded">
                    <Tag className="size-2.5" /> {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
