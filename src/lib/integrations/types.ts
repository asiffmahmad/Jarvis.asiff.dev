export type IntegrationId = 'groq' | 'gmail' | 'openai' | 'claude' | 'gemini' | 'ollama' | 'notion' | 'googledrive' | 'slack' | 'discord' | 'github' | 'gitlab' | 'jira' | 'linear';
export type ProviderCategory = 'ai' | 'productivity' | 'developer' | 'communication' | 'storage';
export type AuthType = 'apikey' | 'oauth' | 'serviceaccount' | 'pat' | 'jwt';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'syncing';

export interface IntegrationCapabilities {
  // AI
  chat?: boolean;
  embeddings?: boolean;
  imageGeneration?: boolean;
  streaming?: boolean;
  // Productivity/Storage
  upload?: boolean;
  download?: boolean;
  search?: boolean;
  // Dev
  repository?: boolean;
  issues?: boolean;
  // Communication
  messaging?: boolean;
  notifications?: boolean;
}

export interface IntegrationProvider {
  id: IntegrationId;
  name: string;
  category: ProviderCategory;
  authType: AuthType;
  brandColor: string;
  isAvailable: boolean; // false for "Coming Soon"
  capabilities: IntegrationCapabilities;
}

export interface ConnectedIntegration {
  id: string; // unique connection id
  providerId: IntegrationId;
  status: ConnectionStatus;
  lastSync: Date;
  metadata?: Record<string, unknown>; // e.g., models available, account email, etc.
}

export interface IntegrationLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}
