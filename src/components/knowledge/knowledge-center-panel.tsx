"use client";

import { motion } from "framer-motion";
import { Search, FileText, Lightbulb, Bookmark, Clock, Star, Tag as TagIcon, Database } from "lucide-react";
import type { KnowledgeState } from "@/lib/knowledge/use-knowledge";
import { cn } from "@/lib/utils";
import type { KnowledgeItem, Tag } from "@/lib/knowledge/types";

interface CenterPanelProps {
  state: KnowledgeState;
}

export function KnowledgeCenterPanel({ state }: CenterPanelProps) {
  const { items, searchQuery, setSearchQuery, setActiveItemId, activeItemId, tags, toggleFavorite } = state;

  return (
    <div className="flex-[1.5] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      
      {/* Header & Search */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-6 shrink-0 z-10 backdrop-blur-md gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-jarvis-text-muted" />
          <input 
            type="text" 
            placeholder="Search knowledge..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-jarvis-panel/30 border border-jarvis-panel-border/50 rounded-full pl-10 pr-4 py-1.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary/50 transition-colors"
          />
        </div>
        <div className="text-xs font-mono text-jarvis-text-muted bg-jarvis-panel/30 px-2 py-1 rounded border border-jarvis-panel-border/30">
          {items.length} items
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
            <Database className="size-8 mb-2" />
            <span className="font-heading uppercase tracking-widest text-xs">No items found</span>
          </div>
        ) : (
          items.map(item => (
            <KnowledgeCard 
              key={item.id} 
              item={item} 
              allTags={tags}
              isActive={activeItemId === item.id}
              onClick={() => setActiveItemId(item.id)}
              onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KnowledgeCard({ 
  item, 
  allTags,
  isActive, 
  onClick, 
  onToggleFavorite 
}: { 
  item: KnowledgeItem; 
  allTags: Tag[];
  isActive: boolean; 
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}) {
  
  const getIcon = () => {
    switch(item.type) {
      case "NOTE": return <FileText className="size-4" />;
      case "DOCUMENT": return <FileText className="size-4 text-jarvis-primary" />;
      case "IDEA": return <Lightbulb className="size-4 text-[#F5A623]" />;
      case "BOOKMARK": return <Bookmark className="size-4 text-[#34F5D0]" />;
      default: return <FileText className="size-4" />;
    }
  };

  const itemTags = allTags.filter(t => item.tags.includes(t.id));

  return (
    <motion.div
      layoutId={`card_${item.id}`}
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all border flex flex-col gap-2 relative group",
        isActive
          ? "bg-jarvis-panel/30 border-jarvis-primary shadow-[0_0_15px_rgba(52,245,208,0.05)]" 
          : "bg-jarvis-panel/10 border-jarvis-panel-border/30 hover:bg-jarvis-panel/20 hover:border-jarvis-panel-border"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-jarvis-bg-deepest border border-jarvis-panel-border/50">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-jarvis-text text-sm leading-tight group-hover:text-jarvis-primary transition-colors">
              {item.title || "Untitled"}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
              <Clock className="size-3" /> {item.updatedAt.toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <button onClick={onToggleFavorite} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Star className={cn("size-4", item.isFavorite ? "text-jarvis-primary fill-jarvis-primary" : "text-jarvis-text-muted")} />
        </button>
      </div>

      <p className="text-xs text-jarvis-text-muted line-clamp-2 mt-2 leading-relaxed">
        {item.content || "Empty content..."}
      </p>

      {itemTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {itemTags.map(tag => (
            <span key={tag.id} className="flex items-center gap-1 text-[9px] font-mono tracking-wider text-jarvis-text/80 bg-jarvis-panel/30 border border-jarvis-panel-border/50 px-1.5 py-0.5 rounded">
              <TagIcon className="size-2.5" style={{ color: tag.color }} /> {tag.name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
