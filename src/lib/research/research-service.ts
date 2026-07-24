import type { Article, RssFeed, Bookmark, Category } from "./types";

type Listener = () => void;

/**
 * Mock Research Service
 * Mocks RSS feed responses to avoid CORS issues in the UI prototype.
 */
export class ResearchService {
  private static instance: ResearchService;
  
  private feeds: RssFeed[] = [];
  private articles: Article[] = [];
  private bookmarks: Bookmark[] = [];
  private listeners: Set<Listener> = new Set();

  private constructor() {
    this.seedMockData();
  }

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

  private seedMockData() {
    const aiFeedId = "feed_1";
    const javaFeedId = "feed_2";

    this.feeds = [
      { id: aiFeedId, title: "OpenAI Blog", url: "https://openai.com/blog/rss", category: "AI", isActive: true },
      { id: javaFeedId, title: "Spring Blog", url: "https://spring.io/blog.atom", category: "JAVA", isActive: true },
    ];

    const now = new Date();

    this.articles = [
      {
        id: "art_1",
        feedId: aiFeedId,
        feedTitle: "OpenAI Blog",
        title: "Introducing GPT-4o: The Omni Model",
        description: "A step towards much more natural human-computer interaction.",
        content: "GPT-4o ('o' for 'omni') is our new flagship model that can reason across audio, vision, and text in real time. It accepts as input any combination of text, audio, and image and generates any combination of text, audio, and image outputs. It can respond to audio inputs in as little as 232 milliseconds, with an average of 320 milliseconds, which is similar to human response time in a conversation.",
        author: "OpenAI Team",
        url: "#",
        publishedAt: new Date(now.getTime() - 86400000), // 1 day ago
        readingTimeMin: 5,
        category: "AI",
        tags: ["GPT-4o", "Multimodal", "Release"]
      },
      {
        id: "art_2",
        feedId: javaFeedId,
        feedTitle: "Spring Blog",
        title: "Spring Boot 3.3 Release Notes",
        description: "The next major release of Spring Boot is finally here.",
        content: "We are pleased to announce the release of Spring Boot 3.3.0. This release adds a significant number of new features and improvements. Upgrading to Spring Boot 3.3 is straightforward for most applications. The primary focus of this release has been on observability, JVM checkpoint/restore (Project CRaC), and container support.",
        author: "Spring Team",
        url: "#",
        publishedAt: new Date(now.getTime() - 172800000), // 2 days ago
        readingTimeMin: 8,
        category: "JAVA",
        tags: ["Spring Boot", "Release", "Java"]
      },
      {
        id: "art_3",
        feedId: aiFeedId,
        feedTitle: "Anthropic Blog",
        title: "Claude 3.5 Sonnet is Here",
        description: "The new standard for frontier AI models.",
        content: "Today we are releasing Claude 3.5 Sonnet—our most capable model yet. It outperforms Claude 3 Opus on a wide range of evaluations, with the speed and cost of our mid-tier model. It shows marked improvements in grasping nuance, humor, and complex instructions, and is exceptional at writing high-quality code with a natural, relatable tone.",
        author: "Anthropic Team",
        url: "#",
        publishedAt: new Date(now.getTime() - 3600000), // 1 hour ago
        readingTimeMin: 4,
        category: "AI",
        tags: ["Claude", "Anthropic", "LLM"]
      }
    ];
  }
}
