import type { Platform, PlatformConstraint } from "./types";

const CONSTRAINTS: Record<Platform, PlatformConstraint> = {
  instagram: {
    platform: "instagram",
    maxCharacters: 2200,
    maxHashtags: 30,
    supportsImages: true,
    supportsVideo: true,
    maxMediaCount: 10,
  },
  linkedin: {
    platform: "linkedin",
    maxCharacters: 3000,
    maxHashtags: 10,
    supportsImages: true,
    supportsVideo: true,
    maxMediaCount: 9,
  },
  x: {
    platform: "x",
    maxCharacters: 280,
    maxHashtags: 5,
    supportsImages: true,
    supportsVideo: true,
    maxMediaCount: 4,
  },
  facebook: {
    platform: "facebook",
    maxCharacters: 63206,
    maxHashtags: 30,
    supportsImages: true,
    supportsVideo: true,
    maxMediaCount: 10,
  },
  threads: {
    platform: "threads",
    maxCharacters: 500,
    maxHashtags: 10,
    supportsImages: true,
    supportsVideo: true,
    maxMediaCount: 10,
  },
  youtube: {
    platform: "youtube",
    maxCharacters: 5000,
    maxHashtags: 15,
    supportsImages: false,
    supportsVideo: true,
    maxMediaCount: 1,
  },
  tiktok: {
    platform: "tiktok",
    maxCharacters: 2200,
    maxHashtags: 30,
    supportsImages: true,
    supportsVideo: true,
    maxMediaCount: 35,
  },
  pinterest: {
    platform: "pinterest",
    maxCharacters: 500,
    maxHashtags: 20,
    supportsImages: true,
    supportsVideo: true,
    maxMediaCount: 1,
  },
};

export class PlatformRepository {
  getConstraint(platform: Platform): PlatformConstraint {
    return CONSTRAINTS[platform];
  }
}

export const platformRepository = new PlatformRepository();
