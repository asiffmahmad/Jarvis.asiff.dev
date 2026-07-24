import type { JARVISSettings, StorageStats } from "./types";

const SETTINGS_STORAGE_KEY = 'jarvis_system_settings_v1';

const defaultSettings: JARVISSettings = {
  appearance: {
    theme: 'dark',
    accentColor: '#34F5D0',
    density: 'comfortable',
    sidebarDensity: 'comfortable',
    reducedMotion: false,
    animations: true,
  },
  profile: {
    name: 'Admin User',
    email: 'admin@jarvis.ai',
    timeZone: 'UTC',
    language: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '24h'
  },
  security: {
    sessionTimeoutMinutes: 60,
    requireMfa: false
  },
  notifications: {
    inApp: true,
    email: false,
    workflows: true,
    agents: true,
    scheduler: true,
    alerts: true
  }
};

export class SettingsService {
  private static instance: SettingsService;

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  public getSettings(): JARVISSettings {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch {
      console.warn("Failed to parse settings from local storage");
    }
    return defaultSettings;
  }

  public saveSettings(settings: JARVISSettings) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }

  public clearSettings() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  }

  public async getStorageStats(): Promise<StorageStats> {
    // Simulate background calculation
    await new Promise(r => setTimeout(r, 800));
    return {
      databaseUsageBytes: 1024 * 1024 * 150, // 150MB
      cachedFilesBytes: 1024 * 1024 * 500, // 500MB
      mediaStorageBytes: 1024 * 1024 * 1024 * 2, // 2GB
      knowledgeStorageBytes: 1024 * 1024 * 300, // 300MB
      logsBytes: 1024 * 1024 * 50, // 50MB
      tempFilesBytes: 1024 * 1024 * 15 // 15MB
    };
  }

  public async clearCache() {
    await new Promise(r => setTimeout(r, 1200));
    // simulated cache clear
  }

  public async exportSettings(): Promise<string> {
    await new Promise(r => setTimeout(r, 500));
    return JSON.stringify(this.getSettings(), null, 2);
  }
}
