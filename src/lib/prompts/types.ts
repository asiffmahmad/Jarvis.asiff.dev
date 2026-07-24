export type PromptCategory = 
  | "Content Creation" 
  | "Social Media" 
  | "Carousel" 
  | "Email" 
  | "Research" 
  | "Coding" 
  | "Translation" 
  | "Productivity" 
  | "Marketing" 
  | "Custom";

export interface PromptVariable {
  name: string;
  defaultValue?: string;
  isRequired: boolean;
  type: "string" | "number" | "select";
  options?: string[]; // For select type
}

export interface PromptVersion {
  id: string;
  promptId: string;
  content: string;
  createdAt: Date;
  author: string;
  message?: string; // Commit message
}

export interface PromptExecutionRecord {
  id: string;
  promptId: string;
  timestamp: Date;
  executionTimeMs: number;
  provider: string;
  model: string;
  variablesUsed: Record<string, string>;
  responseLength: number;
  tokenUsage: number;
  success: boolean;
  error?: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string; // The actual prompt text, containing {{variables}}
  category: PromptCategory;
  tags: string[];
  variables: PromptVariable[];
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  
  // Usage Analytics
  timesUsed: number;
  successRate: number; // 0-100
  averageResponseTimeMs: number;
  lastUsedAt?: Date;
}
