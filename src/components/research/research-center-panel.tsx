"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Tag, Sparkles, Loader2, Send } from "lucide-react";
import type { ResearchState } from "@/lib/research/use-research";
import { cn } from "@/lib/utils";

interface CenterPanelProps {
  state: ResearchState;
}

export function ResearchCenterPanel({ state }: CenterPanelProps) {
  const { articles, selectedArticleId, setSelectedArticleId, selectedCategory, aiSearch, isSearching, allArticles } = state;
  const [researchQuery, setResearchQuery] = useState("");

  const handleSearch = () => {
    if (!researchQuery.trim() || isSearching) return;
    aiSearch(researchQuery.trim());
  };

  return (
    <div className="flex-[1.5] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">

      {/* AI Research Input */}
      <div className="h-20 border-b border-jarvis-panel/30 flex items-center px-6 shrink-0 z-10 backdrop-blur-md gap-3">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-jarvis-primary" />
          <input
            type="text"
            value={researchQuery}
            onChange={(e) => setResearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Ask AI to research any topic..."
            disabled={isSearching}
            className="w-full bg-jarvis-panel/30 border border-jarvis-primary/30 rounded-full pl-10 pr-4 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/70 transition-colors placeholder-jarvis-text-muted/50 disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !researchQuery.trim()}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider shrink-0",
            isSearching || !researchQuery.trim()
              ? "opacity-30 cursor-not-allowed bg-jarvis-panel text-jarvis-text"
              : "bg-jarvis-primary hover:bg-jarvis-primary/80 text-jarvis-bg-deepest"
          )}
        >
          {isSearching ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Send className="size-3" />
          )}
          {isSearching ? "Researching..." : "Research"}
        </button>
        <div className="text-xs font-mono text-jarvis-text-muted bg-jarvis-panel/30 px-2 py-1 rounded border border-jarvis-panel-border/30 shrink-0">
          {allArticles.length} articles
        </div>
      </div>

      {/* Article List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {articles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50 px-8">
            <Sparkles className="size-10 mb-3 text-jarvis-primary/50" />
            <span className="font-heading uppercase tracking-widest text-xs text-center">
              {isSearching ? "AI is researching your topic..." : "No research results yet"}
            </span>
            <p className="text-[10px] font-mono text-jarvis-text-muted/50 mt-2 text-center">
              {isSearching
                ? "Gathering and analyzing information..."
                : "Type a topic above and press Enter to have AI research it"}
            </p>
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
                <span className="text-[9px] text-jarvis-accent border border-jarvis-accent/30 bg-jarvis-accent/10 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">
                  {article.category}
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
