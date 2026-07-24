export type MailLabel = 
  | "INBOX" 
  | "SENT" 
  | "DRAFT" 
  | "TRASH" 
  | "SPAM" 
  | "STARRED" 
  | "IMPORTANT" 
  | "UNREAD" 
  | string; // For custom labels

export interface EmailContact {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number; // bytes
  url?: string; // If hosted
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: EmailContact;
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  subject: string;
  snippet: string;
  bodyHtml: string;
  bodyPlain: string;
  date: Date;
  labels: MailLabel[];
  attachments?: EmailAttachment[];
}

export interface EmailThread {
  id: string;
  messages: EmailMessage[];
  // Extracted from the latest message for convenience
  lastMessageDate: Date;
  subject: string;
  participants: EmailContact[]; // Unique list of people in thread
  labels: MailLabel[];
  snippet: string;
  isUnread: boolean;
  isStarred: boolean;
  isImportant: boolean;
}

export interface AIAnalysis {
  threadId: string;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{ task: string; assignee?: string; deadline?: string }>;
  suggestedReplies: string[];
  tone: "neutral" | "urgent" | "friendly" | "formal" | "angry";
}

export interface MailDraft {
  id: string;
  threadId?: string; // If replying
  to: EmailContact[];
  cc?: EmailContact[];
  bcc?: EmailContact[];
  subject: string;
  bodyHtml: string;
  attachments?: EmailAttachment[];
  lastSavedAt: Date;
}
