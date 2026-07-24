import type { KnowledgeItem, Folder, Tag, KnowledgeLink } from "./types";

type Listener = () => void;

/**
 * Mock Knowledge Service (Second Brain)
 * Acts as an in-memory database for all Knowledge Hub data.
 */
export class KnowledgeService {
  private static instance: KnowledgeService;

  private items: KnowledgeItem[] = [];
  private folders: Folder[] = [];
  private tags: Tag[] = [];
  private links: KnowledgeLink[] = [];
  
  private listeners: Set<Listener> = new Set();

  private constructor() {
    this.seedMockData();
  }

  public static getInstance(): KnowledgeService {
    if (!KnowledgeService.instance) {
      KnowledgeService.instance = new KnowledgeService();
    }
    return KnowledgeService.instance;
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- GETTERS ---
  public getItems(): KnowledgeItem[] {
    return [...this.items].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public getFolders(): Folder[] {
    return [...this.folders];
  }

  public getTags(): Tag[] {
    return [...this.tags];
  }

  public getLinks(): KnowledgeLink[] {
    return [...this.links];
  }

  // --- MUTATIONS ---
  public saveItem(item: KnowledgeItem) {
    const existingIndex = this.items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = { ...item, updatedAt: new Date() };
    } else {
      this.items.push(item);
    }
    this.notify();
  }

  public deleteItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.notify();
  }

  public toggleFavorite(id: string) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      this.notify();
    }
  }

  public addFolder(name: string, parentId: string | null = null) {
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name,
      parentId
    };
    this.folders.push(newFolder);
    this.notify();
  }

  // --- SEED DATA ---
  private seedMockData() {
    const folderArch = "folder_arch";
    const folderDrafts = "folder_drafts";

    this.folders = [
      { id: folderArch, name: "Architecture", parentId: null },
      { id: folderDrafts, name: "Drafts", parentId: null },
    ];

    this.tags = [
      { id: "tag_react", name: "React", color: "#61DAFB" },
      { id: "tag_ai", name: "AI", color: "#34F5D0" },
      { id: "tag_idea", name: "Idea", color: "#F5A623" },
    ];

    const now = new Date();

    this.items = [
      {
        id: "item_1",
        type: "DOCUMENT",
        title: "JARVIS Core Architecture",
        content: "# Core Architecture\n\nJARVIS is built on Next.js App Router.\n\n## Modules\n- Workspace\n- Knowledge Hub\n- Calendar\n- Content Studio\n\nAll state should be globally synced and highly responsive.",
        folderId: folderArch,
        tags: ["tag_react"],
        createdAt: new Date(now.getTime() - 86400000),
        updatedAt: new Date(now.getTime() - 86400000),
        isFavorite: true,
        isArchived: false
      },
      {
        id: "item_2",
        type: "IDEA",
        title: "Integrate Agent Framework with Second Brain",
        content: "We should allow AI Agents to automatically summarize emails and drop them into the Knowledge Hub as new 'Notes'. \n\nNeed to define the API contract for `KnowledgeService.saveItem()` to be called from the server actions.",
        folderId: null,
        tags: ["tag_ai", "tag_idea"],
        createdAt: new Date(now.getTime() - 3600000),
        updatedAt: now,
        isFavorite: false,
        isArchived: false
      },
      {
        id: "item_3",
        type: "NOTE",
        title: "Meeting Notes: Content Studio v2",
        content: "- Add bulk publishing\n- Support multi-image carousels natively\n- Add Instagram Reels export",
        folderId: folderDrafts,
        tags: [],
        createdAt: new Date(now.getTime() - 7200000),
        updatedAt: new Date(now.getTime() - 7200000),
        isFavorite: false,
        isArchived: false
      }
    ];

    this.links = [
      { sourceId: "item_2", targetId: "item_1", description: "Relates to Core Architecture" }
    ];
  }
}
