import type { Platform } from "./types";
import { platformRepository } from "./platform-repository";

export class PreviewEngine {
  /**
   * Transforms raw HTML/text into a platform-specific preview.
   * This is a simplified mockup of a preview engine.
   */
  generatePreview(content: string, platform: Platform): string {
    const constraints = platformRepository.getConstraint(platform);
    
    // Strip HTML for platforms that don't support it (most social platforms just want plain text)
    // A robust implementation would use a real HTML to Markdown/Text parser
    let plainText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    
    if (plainText.length > constraints.maxCharacters) {
      plainText = plainText.substring(0, constraints.maxCharacters) + "…";
    }

    return plainText;
  }
}

export const previewEngine = new PreviewEngine();
