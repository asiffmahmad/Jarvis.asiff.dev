export type ItemType = "NOTE" | "DOCUMENT" | "IDEA" | "BOOKMARK";

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Folder {
  id: string;
  parentId: string | null;
  name: string;
}

export interface KnowledgeItem {
  id: string;
  type: ItemType;
  title: string;
  content: string; // Markdown or raw text
  folderId: string | null;
  tags: string[]; // Tag IDs
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  isArchived: boolean;
  url?: string; // For bookmarks
}

// For rendering linking visually
export interface KnowledgeLink {
  sourceId: string;
  targetId: string;
  description?: string;
}
