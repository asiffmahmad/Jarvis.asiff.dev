import { useState, useMemo, useCallback } from "react";
import type { Prompt } from "./types";

// Helper to extract {{variables}}
export function extractVariableNames(content: string): string[] {
  const regex = /{{(.*?)}}/g;
  const matches = [...content.matchAll(regex)];
  return Array.from(new Set(matches.map(m => m[1].trim())));
}

// Mock Data
const MOCK_PROMPTS: Prompt[] = [
  {
    id: "prompt-1",
    title: "Instagram Carousel Generator",
    description: "Generates a highly engaging 5-slide Instagram carousel script based on a specific topic.",
    content: "You are an expert Instagram marketer. Create a 5-slide carousel script about {{topic}}. The audience is {{audience}}. The tone should be {{tone}}. Ensure each slide has a clear headline and body copy.",
    category: "Carousel",
    tags: ["instagram", "marketing", "carousel"],
    variables: [
      { name: "topic", type: "string", isRequired: true },
      { name: "audience", type: "string", isRequired: true, defaultValue: "digital marketers" },
      { name: "tone", type: "select", isRequired: true, options: ["educational", "funny", "inspirational"] }
    ],
    isFavorite: true,
    isPinned: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    author: "System",
    timesUsed: 42,
    successRate: 98,
    averageResponseTimeMs: 1250,
  },
  {
    id: "prompt-2",
    title: "Cold Email Outreach",
    description: "Write a high-converting B2B cold email.",
    content: "Write a short, punchy cold email to a {{job_title}} at a {{industry}} company. I am selling {{product}}. Focus on the pain point of {{pain_point}} and end with a soft CTA.",
    category: "Email",
    tags: ["sales", "b2b", "outreach"],
    variables: [
      { name: "job_title", type: "string", isRequired: true },
      { name: "industry", type: "string", isRequired: true },
      { name: "product", type: "string", isRequired: true },
      { name: "pain_point", type: "string", isRequired: true }
    ],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 10),
    author: "System",
    timesUsed: 15,
    successRate: 85,
    averageResponseTimeMs: 950,
  },
  {
    id: "prompt-3",
    title: "Deep Research Summarizer",
    description: "Summarize academic papers into digestible insights.",
    content: "Act as a post-doctoral researcher. Summarize the following text into 3 key takeaways, the methodology used, and potential limitations. \n\nText: {{source_text}}",
    category: "Research",
    tags: ["academic", "summary"],
    variables: [
      { name: "source_text", type: "string", isRequired: true }
    ],
    isFavorite: true,
    isPinned: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 1),
    author: "System",
    timesUsed: 8,
    successRate: 100,
    averageResponseTimeMs: 3200,
  }
];

export type PromptState = ReturnType<typeof usePrompts>;

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>(MOCK_PROMPTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null); // null = All, "favorites" = Favorites, otherwise Category string
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      // 1. Filter by category or smart collection
      if (selectedCategoryId === "favorites" && !p.isFavorite) return false;
      if (selectedCategoryId === "archived" && !p.isArchived) return false;
      
      // Hide archived from normal views
      if (selectedCategoryId !== "archived" && p.isArchived) return false;

      if (selectedCategoryId && !["favorites", "archived", "recent"].includes(selectedCategoryId)) {
        if (p.category !== selectedCategoryId) return false;
      }

      // 2. Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some(t => t.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [prompts, searchQuery, selectedCategoryId]);

  const activePrompt = useMemo(() => {
    return prompts.find(p => p.id === selectedPromptId) || null;
  }, [prompts, selectedPromptId]);

  const addPrompt = useCallback((prompt: Omit<Prompt, "id" | "createdAt" | "updatedAt" | "timesUsed" | "successRate" | "averageResponseTimeMs">) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      timesUsed: 0,
      successRate: 100,
      averageResponseTimeMs: 0,
    };
    setPrompts(prev => [newPrompt, ...prev]);
    setSelectedPromptId(newPrompt.id);
  }, []);

  const updatePrompt = useCallback((id: string, updates: Partial<Prompt>) => {
    setPrompts(prev => prev.map(p => {
      if (p.id === id) {
        const updatedContent = updates.content ?? p.content;
        
        // Auto-sync variables if content changed
        let updatedVariables = updates.variables ?? p.variables;
        if (updates.content) {
          const names = extractVariableNames(updatedContent);
          // Keep existing variable config, add new ones, remove unused ones
          updatedVariables = names.map(name => {
            const existing = p.variables.find(v => v.name === name);
            return existing || { name, isRequired: true, type: "string" };
          });
        }

        return { ...p, ...updates, variables: updatedVariables, updatedAt: new Date() };
      }
      return p;
    }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  }, []);

  const deletePrompt = useCallback((id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    if (selectedPromptId === id) setSelectedPromptId(null);
  }, [selectedPromptId]);

  const duplicatePrompt = useCallback((id: string) => {
    const promptToCopy = prompts.find(p => p.id === id);
    if (!promptToCopy) return;
    
    const newPrompt: Prompt = {
      ...promptToCopy,
      id: crypto.randomUUID(),
      title: `${promptToCopy.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      timesUsed: 0,
      isFavorite: false,
      isPinned: false,
    };
    setPrompts(prev => [newPrompt, ...prev]);
    setSelectedPromptId(newPrompt.id);
  }, [prompts]);

  return {
    prompts: filteredPrompts,
    allPrompts: prompts,
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedPromptId,
    setSelectedPromptId,
    activePrompt,
    addPrompt,
    updatePrompt,
    toggleFavorite,
    deletePrompt,
    duplicatePrompt,
  };
}
