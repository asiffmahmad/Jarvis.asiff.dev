export type Category = 
  | "ALL"
  | "AI"
  | "TECHNOLOGY"
  | "JAVA"
  | "SPRING_BOOT"
  | "CLOUD"
  | "DEVOPS";

export interface RssFeed {
  id: string;
  title: string;
  url: string;
  category: Category;
  isActive: boolean;
  faviconUrl?: string;
}

export interface Article {
  id: string;
  feedId: string;
  feedTitle: string;
  title: string;
  description: string;
  content: string;
  author: string;
  url: string;
  publishedAt: Date;
  readingTimeMin: number;
  category: Category;
  tags: string[];
}

export interface Bookmark {
  id: string;
  articleId: string;
  savedAt: Date;
  notes?: string;
  folderId?: string;
}

export interface IResearchProvider {
  name: string;
  fetchLatest: (feed: RssFeed) => Promise<Article[]>;
}
