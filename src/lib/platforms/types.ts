export type PlatformId = 'instagram' | 'linkedin' | 'x';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'expired' | 'error' | 'syncing';

export interface ProviderCapabilities {
  publishText: boolean;
  publishImage: boolean;
  publishCarousel: boolean;
  publishVideo: boolean;
  draftSupport: boolean;
  scheduling: boolean;
  analytics: boolean;
  comments: boolean;
  hashtags: boolean;
}

export interface PlatformProvider {
  id: PlatformId;
  name: string;
  brandColor: string;
  isAvailable: boolean; // false for "Coming Soon"
  capabilities: ProviderCapabilities;
}

export interface ConnectedAccount {
  id: string; // Unique ID for this specific connection
  platformId: PlatformId;
  accountName: string;
  handle: string;
  avatarUrl?: string;
  status: ConnectionStatus;
  lastSync: Date;
  metadata?: Record<string, unknown>;
}

export interface SyncLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}
