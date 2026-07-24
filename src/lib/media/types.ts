export type AssetType = "image" | "video" | "document" | "unknown";

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: AssetType;
  sizeBytes: number;
  createdAt: string;
  folderId: string | null;
  tags: string[];
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    aiPrompt?: string;
    model?: string;
  };
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  assetIds: string[];
}
