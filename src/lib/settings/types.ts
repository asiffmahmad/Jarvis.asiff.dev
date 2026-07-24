export type SettingsCategory = 'appearance' | 'profile' | 'security' | 'storage' | 'logs' | 'shortcuts' | 'notifications' | 'backup' | 'accessibility' | 'about' | 'advanced';

// --- Category Specific Models ---

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  density: 'compact' | 'comfortable';
  sidebarDensity: 'compact' | 'comfortable';
  reducedMotion: boolean;
  animations: boolean;
}

export interface ProfileSettings {
  name: string;
  email: string;
  avatarUrl?: string;
  timeZone: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  requireMfa: boolean;
}

export interface NotificationSettings {
  inApp: boolean;
  email: boolean;
  workflows: boolean;
  agents: boolean;
  scheduler: boolean;
  alerts: boolean;
}

// --- Global Settings Object ---
export interface JARVISSettings {
  appearance: AppearanceSettings;
  profile: ProfileSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
}

export interface StorageStats {
  databaseUsageBytes: number;
  cachedFilesBytes: number;
  mediaStorageBytes: number;
  knowledgeStorageBytes: number;
  logsBytes: number;
  tempFilesBytes: number;
}
