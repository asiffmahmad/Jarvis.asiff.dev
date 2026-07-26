export type Platform = "instagram" | "linkedin" | "x" | "facebook" | "threads" | "youtube" | "tiktok" | "pinterest";

export type ContentTone = "professional" | "casual" | "inspirational" | "humorous" | "educational" | "controversial";

export type ContentType = "post" | "thread" | "carousel" | "story" | "reel";

export interface GeneratedPost {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  mediaIdeas: string[];
  seoKeywords: string[];
  callToAction: string;
  bestPostingTime: string;
  platform: Platform;
  contentType: ContentType;
  tone: ContentTone;
  characterCount: number;
  createdAt: string;
}

export interface GeneratePostRequest {
  topic: string;
  platform: Platform;
  tone: ContentTone;
  contentType: ContentType;
  targetAudience?: string;
  keyPoints?: string[];
}

export interface RegeneratePostRequest {
  topic: string;
  platform: string;
  tone: string;
  contentType: string;
  existingPost: {
    title: string;
    caption: string;
    hashtags: string[];
  };
  feedback: string;
}

export interface SchedulePostRequest {
  post: GeneratedPost;
  platform: Platform;
  scheduleFor: string;
  accountId: string;
}

export interface SchedulePostResponse {
  jobId: string;
  status: string;
  scheduledFor: string;
}
