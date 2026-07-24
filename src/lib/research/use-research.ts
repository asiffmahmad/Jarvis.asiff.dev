import { useState, useEffect, useMemo, useCallback } from "react";
import { ResearchService } from "./research-service";
import type { Article, Bookmark, Category } from "./types";

export type ResearchState = ReturnType<typeof useResearch>;

export function useResearch() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<Category | "BOOKMARKS">("ALL");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const service = useMemo(() => ResearchService.getInstance(), []);

  const refresh = useCallback(() => {
    setArticles(service.getArticles());
    setBookmarks(service.getBookmarks());
  }, [service]);

  useEffect(() => {
    // Initial load
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    
    // Subscribe to updates
    const unsubscribe = service.subscribe(() => {
      refresh();
    });
    return () => { unsubscribe(); };
  }, [service, refresh]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Category Filter
    if (selectedCategory === "BOOKMARKS") {
      const bookmarkedIds = new Set(bookmarks.map(b => b.articleId));
      result = result.filter(a => bookmarkedIds.has(a.id));
    } else if (selectedCategory !== "ALL") {
      result = result.filter(a => a.category === selectedCategory);
    }

    // Search Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.description.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [articles, bookmarks, selectedCategory, searchQuery]);

  const activeArticle = useMemo(() => articles.find(a => a.id === selectedArticleId) || null, [articles, selectedArticleId]);
  
  const isBookmarked = (articleId: string) => bookmarks.some(b => b.articleId === articleId);

  return {
    articles: filteredArticles,
    selectedCategory,
    setSelectedCategory,
    selectedArticleId,
    setSelectedArticleId,
    searchQuery,
    setSearchQuery,
    activeArticle,
    isBookmarked,
    
    // Actions
    toggleBookmark: (id: string) => service.toggleBookmark(id),
  };
}
