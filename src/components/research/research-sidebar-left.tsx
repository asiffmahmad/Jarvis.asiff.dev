"use client";

import { motion } from "framer-motion";
import { Compass, Bookmark, Hash, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ResearchState } from "@/lib/research/use-research";
import type { Category } from "@/lib/research/types";

interface SidebarProps {
  state: ResearchState;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "ALL", label: "Dashboard" },
  { id: "AI", label: "AI & ML" },
  { id: "TECHNOLOGY", label: "Technology" },
  { id: "JAVA", label: "Java Ecosystem" },
  { id: "SPRING_BOOT", label: "Spring Boot" },
  { id: "CLOUD", label: "Cloud & DevOps" },
];

export function ResearchSidebarLeft({ state }: SidebarProps) {
  const { selectedCategory, setSelectedCategory } = state;

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg">
          Research
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          Knowledge Base Sync Active
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 mb-6 mt-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 group text-sm font-medium",
                  isSelected
                    ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
                    : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
                )}
              >
                {cat.id === "ALL" ? <Compass className="size-4" /> : <Hash className="size-4 opacity-50" />}
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="px-2">
          <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <Layers className="size-3" /> Library
          </h3>
          <button
            onClick={() => setSelectedCategory("BOOKMARKS")}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 group text-sm font-medium",
              selectedCategory === "BOOKMARKS"
                ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
                : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
            )}
          >
            <Bookmark className="size-4" /> Bookmarks
          </button>
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
