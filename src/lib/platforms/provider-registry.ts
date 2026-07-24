import type { PlatformProvider, PlatformId } from "./types";

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<PlatformId, PlatformProvider> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  private registerDefaults() {
    const defaultProviders: PlatformProvider[] = [
      // Active Platforms
      {
        id: "instagram", name: "Instagram", brandColor: "#E1306C", isAvailable: true,
        capabilities: { publishText: false, publishImage: true, publishCarousel: true, publishVideo: true, draftSupport: false, scheduling: true, analytics: true, comments: true, hashtags: true }
      },
      {
        id: "linkedin", name: "LinkedIn", brandColor: "#0A66C2", isAvailable: true,
        capabilities: { publishText: true, publishImage: true, publishCarousel: true, publishVideo: true, draftSupport: false, scheduling: true, analytics: true, comments: false, hashtags: true }
      },
      {
        id: "x", name: "X (Twitter)", brandColor: "#000000", isAvailable: true,
        capabilities: { publishText: true, publishImage: true, publishCarousel: false, publishVideo: true, draftSupport: false, scheduling: true, analytics: true, comments: true, hashtags: true }
      },
    ];

    defaultProviders.forEach(p => this.providers.set(p.id, p));
  }

  public getProviders(): PlatformProvider[] {
    return Array.from(this.providers.values());
  }

  public getProvider(id: PlatformId): PlatformProvider | undefined {
    return this.providers.get(id);
  }
}
