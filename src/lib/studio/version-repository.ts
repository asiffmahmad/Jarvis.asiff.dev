import type { ContentVersion } from "./types";

/**
 * Version Repository (Mock implementation)
 */
class VersionRepository {
  private versions: Map<string, ContentVersion[]> = new Map();

  async getVersions(draftId: string): Promise<ContentVersion[]> {
    return this.versions.get(draftId) || [];
  }

  async saveVersion(version: ContentVersion): Promise<void> {
    const existing = this.versions.get(version.draftId) || [];
    this.versions.set(version.draftId, [...existing, version].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }
}

export const versionRepository = new VersionRepository();
