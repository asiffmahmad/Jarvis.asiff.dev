import type { ContentDraft } from "./types";

/**
 * Draft Repository (Mock implementation for now)
 * This encapsulates data access. Later it can be easily swapped for Prisma.
 */
class DraftRepository {
  private drafts: Map<string, ContentDraft> = new Map();

  async getDrafts(): Promise<ContentDraft[]> {
    return Array.from(this.drafts.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getDraft(id: string): Promise<ContentDraft | null> {
    return this.drafts.get(id) || null;
  }

  async saveDraft(draft: ContentDraft): Promise<void> {
    this.drafts.set(draft.id, {
      ...draft,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteDraft(id: string): Promise<void> {
    this.drafts.delete(id);
  }
}

export const draftRepository = new DraftRepository();
