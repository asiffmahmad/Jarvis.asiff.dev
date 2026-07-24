const RESEARCH_KEY = "jarvis_research_context";
const POST_KEY = "jarvis_generated_post";
const PENDING_GEN_KEY = "jarvis_pending_generation";

export interface ResearchContext {
  topic: string;
  context: string;
}

export interface PostData {
  title: string;
  caption: string;
  hashtags: string[];
  mediaIdeas: string[];
  callToAction: string;
  platform: string;
  bestPostingTime: string;
  topic?: string;
  tone?: string;
  contentType?: string;
}

export interface PendingGeneration {
  topic: string;
  platform: string;
  tone: string;
  contentType: string;
}

// Research context

export function storeResearchContext(data: ResearchContext) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(RESEARCH_KEY, JSON.stringify(data));
  }
}

export function getResearchContext(): ResearchContext | null {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(RESEARCH_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return null;
}

export function clearResearchContext() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(RESEARCH_KEY);
  }
}

// Finalized post to review

export function storeGeneratedPost(data: PostData) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(POST_KEY, JSON.stringify(data));
  }
}

export function getGeneratedPost(): PostData | null {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(POST_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return null;
}

export function clearGeneratedPost() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(POST_KEY);
  }
}

// Async pending generation (triggers generate-in-progress state on /create)

export function storePendingGeneration(data: PendingGeneration) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(PENDING_GEN_KEY, JSON.stringify(data));
  }
}

export function getPendingGeneration(): PendingGeneration | null {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(PENDING_GEN_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return null;
}

export function clearPendingGeneration() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(PENDING_GEN_KEY);
  }
}
