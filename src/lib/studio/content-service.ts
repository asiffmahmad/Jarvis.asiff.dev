import { draftRepository } from "./draft-repository";
import { platformRepository } from "./platform-repository";
import type { ContentDraft, ContentScore, Platform } from "./types";

export class ContentService {
  /**
   * Initializes a new draft
   */
  async createDraft(title: string, platform: Platform = "linkedin"): Promise<ContentDraft> {
    const id = crypto.randomUUID();
    const draft: ContentDraft = {
      id,
      title,
      content: "",
      platform,
      contentType: "custom",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };
    await draftRepository.saveDraft(draft);
    return draft;
  }

  /**
   * Autosaves content
   */
  async updateDraftContent(id: string, content: string): Promise<void> {
    const draft = await draftRepository.getDraft(id);
    if (!draft) return;
    
    await draftRepository.saveDraft({
      ...draft,
      content,
    });
  }

  /**
   * Calculates content score metrics based on platform constraints and raw text.
   */
  analyzeContent(content: string, platform: Platform): ContentScore {
    // Basic text extraction for word/char count
    const plainText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const characterCount = plainText.length;
    const wordCount = plainText.length > 0 ? plainText.split(/\s+/).length : 0;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    
    const constraints = platformRepository.getConstraint(platform);
    
    const issues: string[] = [];
    if (characterCount > constraints.maxCharacters) {
      issues.push(`Exceeds maximum character limit (${constraints.maxCharacters})`);
    }

    // Naive mock scores
    return {
      characterCount,
      wordCount,
      readingTimeMinutes,
      seoScore: Math.min(100, Math.floor(Math.random() * 20 + 80)),
      aiQualityScore: Math.min(100, Math.floor(Math.random() * 20 + 80)),
      readabilityScore: Math.min(100, Math.floor(Math.random() * 20 + 80)),
      platformCompatibility: characterCount <= constraints.maxCharacters,
      issues,
    };
  }
}

export const contentService = new ContentService();
