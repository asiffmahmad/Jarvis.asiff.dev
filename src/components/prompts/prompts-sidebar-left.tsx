"use client";

import { motion } from "framer-motion";
import { Folder, Star, Clock, Archive, TerminalSquare, Layers, Tag, Code, Briefcase, Brain, Lightbulb, Share2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Prompt, PromptCategory } from "@/lib/prompts/types";
import type { PromptState } from "@/lib/prompts/use-prompts";

interface PromptsSidebarLeftProps {
  promptState: PromptState;
}

const CATEGORIES: { id: PromptCategory; label: string; icon: React.ElementType }[] = [
  { id: "Content Creation", label: "Content Creation", icon: TerminalSquare },
  { id: "Social Media", label: "Social Media", icon: Share2 },
  { id: "Carousel", label: "Carousel", icon: Layers },
  { id: "Email", label: "Email", icon: Briefcase },
  { id: "Research", label: "Research", icon: Brain },
  { id: "Coding", label: "Coding", icon: Code },
  { id: "Translation", label: "Translation", icon: Tag },
  { id: "Productivity", label: "Productivity", icon: Clock },
  { id: "Marketing", label: "Marketing", icon: Lightbulb },
  { id: "Custom", label: "Custom", icon: Folder },
];

export function PromptsSidebarLeft({ promptState }: PromptsSidebarLeftProps) {
  const { selectedCategoryId, setSelectedCategoryId, allPrompts } = promptState;

  const handleSelect = (id: string | null) => {
    setSelectedCategoryId(id);
  };

  const activeCount = allPrompts.filter((p: Prompt) => !p.isArchived).length;
  const favoriteCount = allPrompts.filter((p: Prompt) => p.isFavorite && !p.isArchived).length;
  const archivedCount = allPrompts.filter((p: Prompt) => p.isArchived).length;

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading text-sm font-bold tracking-widest text-jarvis-primary uppercase text-glow">
          Library
        </h2>
      </div>

      <ScrollArea className="flex-1 p-2">
        <nav className="space-y-1 mb-6">
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 group",
              selectedCategoryId === null
                ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
                : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <Folder className="size-4" />
              <span className="text-sm font-medium">All Prompts</span>
            </div>
            <span className="text-xs text-jarvis-text-muted">{activeCount}</span>
          </button>
          
          <button
            onClick={() => handleSelect("favorites")}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 group",
              selectedCategoryId === "favorites"
                ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
                : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <Star className="size-4" />
              <span className="text-sm font-medium">Favorites</span>
            </div>
            <span className="text-xs text-jarvis-text-muted">{favoriteCount}</span>
          </button>
        </nav>

        <div className="px-2 mb-2">
          <h3 className="text-xs font-bold text-jarvis-text-muted uppercase tracking-wider">
            Categories
          </h3>
        </div>
        
        <nav className="space-y-1">
          {CATEGORIES.map((cat) => {
            const count = allPrompts.filter((p: Prompt) => p.category === cat.id && !p.isArchived).length;
            const isSelected = selectedCategoryId === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 group",
                  isSelected
                    ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
                    : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <cat.icon className="size-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                {count > 0 && (
                  <span className="text-xs text-jarvis-text-muted">{count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-jarvis-panel/30">
        <button
          onClick={() => handleSelect("archived")}
          className={cn(
            "w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 group",
            selectedCategoryId === "archived"
              ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
              : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
          )}
        >
          <div className="flex items-center gap-3 text-jarvis-text-muted group-hover:text-jarvis-text">
            <Archive className="size-4" />
            <span className="text-sm font-medium">Archived</span>
          </div>
          {archivedCount > 0 && (
            <span className="text-xs text-jarvis-text-muted">{archivedCount}</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
