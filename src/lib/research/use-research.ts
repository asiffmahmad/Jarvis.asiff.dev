import { useState, useEffect, useMemo, useCallback } from "react";
import { ResearchService } from "./research-service";
import type { Article, Bookmark, Category } from "./types";

export type ResearchState = ReturnType<typeof useResearch>;

export function useResearch() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | "BOOKMARKS">("ALL");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const service = useMemo(() => ResearchService.getInstance(), []);

  const refresh = useCallback(() => {
    setArticles(service.getArticles());
    setBookmarks(service.getBookmarks());
  }, [service]);

  useEffect(() => {
    refresh();
    const unsubscribe = service.subscribe(() => {
      refresh();
    });
    return () => { unsubscribe(); };
  }, [service, refresh]);

  const aiSearch = useCallback(async (query: string) => {
    if (!query.trim() || isSearching) return;
    setIsSearching(true);

    try {
      const res = await fetch("/api/research/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) throw new Error(`Search failed: ${res.status}`);

      const data = await res.json();
      for (const article of data.articles) {
        service.addArticle(article);
      }
      setSearchQuery(query.trim());
      setSelectedCategory("ALL");
    } catch (err) {
      console.error("AI research search failed:", err);
    } finally {
      setIsSearching(false);
    }
  }, [service, isSearching]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (selectedCategory === "BOOKMARKS") {
      const bookmarkedIds = new Set(bookmarks.map(b => b.articleId));
      result = result.filter(a => bookmarkedIds.has(a.id));
    } else if (selectedCategory !== "ALL") {
      result = result.filter(a => a.category === selectedCategory);
    }

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
    allArticles: articles,
    selectedCategory,
    setSelectedCategory,
    selectedArticleId,
    setSelectedArticleId,
    searchQuery,
    setSearchQuery,
    activeArticle,
    isBookmarked,
    isSearching,
    aiSearch,

    toggleBookmark: (id: string) => service.toggleBookmark(id),
  };
}
