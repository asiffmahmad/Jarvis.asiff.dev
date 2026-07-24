import { MOCK_THREADS, MOCK_LABELS } from "./mock-data";
import type { EmailThread, MailLabel } from "./types";

/**
 * Mock Gmail Service
 * Simulates fetching from a backend service that would connect to Gmail API.
 */
export class GmailService {
  private static instance: GmailService;
  
  // In-memory store
  private threads: EmailThread[] = [...MOCK_THREADS];

  private constructor() {}

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  public async getThreads(filterLabel?: MailLabel): Promise<EmailThread[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!filterLabel) return this.threads;
    
    return this.threads.filter(t => t.labels.includes(filterLabel));
  }

  public async getThread(id: string): Promise<EmailThread | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.threads.find(t => t.id === id);
  }

  public async toggleStar(threadId: string): Promise<void> {
    const t = this.threads.find(x => x.id === threadId);
    if (t) {
      t.isStarred = !t.isStarred;
      if (t.isStarred) {
        if (!t.labels.includes("STARRED")) t.labels.push("STARRED");
      } else {
        t.labels = t.labels.filter(l => l !== "STARRED");
      }
    }
  }

  public async toggleRead(threadId: string, isUnread: boolean): Promise<void> {
    const t = this.threads.find(x => x.id === threadId);
    if (t) {
      t.isUnread = isUnread;
      if (isUnread) {
        if (!t.labels.includes("UNREAD")) t.labels.push("UNREAD");
      } else {
        t.labels = t.labels.filter(l => l !== "UNREAD");
      }
    }
  }

  public async getLabels() {
    return MOCK_LABELS;
  }

  // Future abstraction methods
  public async sendReply(threadId: string, body: string) {
    // mock send
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Sending reply to ${threadId}:`, body);
  }

  public async saveDraft(threadId: string, body: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Draft saved for ${threadId}:`, body);
  }
}
