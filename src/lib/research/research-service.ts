import type { Article, RssFeed, Bookmark } from "./types";

type Listener = () => void;

export class ResearchService {
  private static instance: ResearchService;

  private feeds: RssFeed[] = [];
  private articles: Article[] = [];
  private bookmarks: Bookmark[] = [];
  private listeners: Set<Listener> = new Set();

  private constructor() {}

  public static getInstance(): ResearchService {
    if (!ResearchService.instance) {
      ResearchService.instance = new ResearchService();
    }
    return ResearchService.instance;
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getFeeds(): RssFeed[] {
    return [...this.feeds];
  }

  public getArticles(): Article[] {
    return [...this.articles].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  public getBookmarks(): Bookmark[] {
    return [...this.bookmarks];
  }

  public addArticle(article: Article) {
    this.articles.unshift(article);
    this.notify();
  }

  public toggleBookmark(articleId: string) {
    const existingIndex = this.bookmarks.findIndex(b => b.articleId === articleId);
    if (existingIndex >= 0) {
      this.bookmarks.splice(existingIndex, 1);
    } else {
      this.bookmarks.push({
        id: `bmk_${Date.now()}`,
        articleId,
        savedAt: new Date()
      });
    }
    this.notify();
  }
}
