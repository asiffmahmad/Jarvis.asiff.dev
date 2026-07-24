"use client";

import { Search, SlidersHorizontal, Plus, FileText } from "lucide-react";
import { PromptCard } from "./prompt-card";
import type { PromptState } from "@/lib/prompts/use-prompts";
import type { Prompt, PromptCategory } from "@/lib/prompts/types";

interface PromptsWorkspaceProps {
  promptState: PromptState;
}

export function PromptsWorkspace({ promptState }: PromptsWorkspaceProps) {
  const {
    prompts,
    searchQuery,
    setSearchQuery,
    selectedPromptId,
    setSelectedPromptId,
    selectedCategoryId,
    toggleFavorite,
    addPrompt
  } = promptState;

  const getCategoryTitle = () => {
    if (selectedCategoryId === null) return "All Prompts";
    if (selectedCategoryId === "favorites") return "Favorites";
    if (selectedCategoryId === "archived") return "Archived";
    return selectedCategoryId;
  };

  const handleCreateNew = () => {
    addPrompt({
      title: "New Prompt",
      description: "",
      content: "",
      category: (selectedCategoryId !== null && selectedCategoryId !== "favorites" && selectedCategoryId !== "archived" 
        ? selectedCategoryId 
        : "Custom") as PromptCategory,
      tags: [],
      variables: [],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      author: "User",
    });
  };

  return (
    <div className="flex-1 flex flex-col relative h-full bg-jarvis-bg-deepest/50">
      {/* Header / Search Bar */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center justify-between px-6 shrink-0 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-jarvis-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts by name, description, tags, or content..."
              className="w-full bg-jarvis-bg-deep/50 border border-jarvis-panel-border/50 text-jarvis-text text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-jarvis-primary/50 focus:ring-1 focus:ring-jarvis-primary/50 transition-all placeholder-jarvis-text-muted/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel/30 rounded-lg transition-colors border border-jarvis-panel-border/30">
            <SlidersHorizontal className="size-4" />
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30 rounded-full text-sm font-bold tracking-wide uppercase hover:bg-jarvis-primary hover:text-jarvis-bg-deepest transition-all shadow-[0_0_15px_rgba(52,245,208,0.2)]"
          >
            <Plus className="size-4" />
            New Prompt
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-y-auto p-6" 
        onClick={(e) => {
          // Deselect if clicking on empty workspace background
          if (e.target === e.currentTarget) {
            setSelectedPromptId(null);
          }
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold text-jarvis-text uppercase tracking-widest text-glow">
            {getCategoryTitle()}
          </h1>
          <p className="text-sm text-jarvis-text-muted font-medium">
            {prompts.length} {prompts.length === 1 ? "Prompt" : "Prompts"}
          </p>
        </div>

        {prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60%] text-jarvis-text-muted opacity-50">
            <FileText className="size-16 mb-4" />
            <p className="font-heading tracking-widest uppercase">No Prompts Found</p>
            <p className="text-sm mt-2">Adjust your search or create a new prompt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {prompts.map((prompt: Prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isSelected={selectedPromptId === prompt.id}
                onSelect={() => setSelectedPromptId(prompt.id)}
                onToggleFavorite={(e) => {
                  e.stopPropagation();
                  toggleFavorite(prompt.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
