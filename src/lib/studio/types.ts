export type Platform = "instagram" | "linkedin" | "x" | "facebook" | "threads" | "youtube" | "tiktok";

export type ContentType = "post" | "carousel" | "reel" | "thread" | "blog" | "newsletter" | "custom";

export interface ContentDraft {
  id: string;
  title: string;
  content: string; // HTML or JSON from rich editor
  platform: Platform;
  contentType: ContentType;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ContentVersion {
  id: string;
  draftId: string;
  content: string;
  createdAt: string;
  author: string;
  commitMessage?: string;
}

export interface PlatformConstraint {
  platform: Platform;
  maxCharacters: number;
  maxHashtags: number;
  supportsImages: boolean;
  supportsVideo: boolean;
  maxMediaCount: number;
}

export interface ContentScore {
  characterCount: number;
  wordCount: number;
  readingTimeMinutes: number;
  seoScore: number;
  aiQualityScore: number;
  readabilityScore: number;
  platformCompatibility: boolean;
  issues: string[];
}
