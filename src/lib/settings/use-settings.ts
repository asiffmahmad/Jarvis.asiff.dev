import { useState, useMemo } from "react";
import { SettingsService } from "./settings-service";
import type { JARVISSettings, SettingsCategory, StorageStats } from "./types";

export type SettingsState = ReturnType<typeof useSettings>;

export function useSettings() {
  const service = useMemo(() => SettingsService.getInstance(), []);

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('appearance');
  const [settings, setSettings] = useState<JARVISSettings>(() => service.getSettings());
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Storage specific state
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [isCalculatingStorage, setIsCalculatingStorage] = useState(false);

  const handleCategoryChange = (category: SettingsCategory) => {
    setActiveCategory(category);
    if (category === 'storage' && !storageStats) {
      setIsCalculatingStorage(true);
      service.getStorageStats().then(stats => {
        setStorageStats(stats);
        setIsCalculatingStorage(false);
      });
    }
  };

  const updateSettings = (updater: (prev: JARVISSettings) => JARVISSettings) => {
    setSettings(prev => updater(prev));
    setIsDirty(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 400)); // simulated latency
      service.saveSettings(settings);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(service.getSettings());
    setIsDirty(false);
  };

  const restoreDefaults = async () => {
    if (confirm("Are you sure you want to restore all settings to default?")) {
      service.clearSettings();
      resetSettings();
    }
  };

  const clearCache = async () => {
    await service.clearCache();
    // Refresh stats
    setIsCalculatingStorage(true);
    service.getStorageStats().then(stats => {
      // Mock: set cached files to 0
      setStorageStats({ ...stats, cachedFilesBytes: 0, tempFilesBytes: 0 });
      setIsCalculatingStorage(false);
    });
  };

  const exportSettings = async () => {
    const json = await service.exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_settings_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    activeCategory,
    setActiveCategory: handleCategoryChange,
    settings,
    updateSettings,
    isDirty,
    isSaving,
    saveSettings,
    resetSettings,
    restoreDefaults,
    exportSettings,
    // Storage
    storageStats,
    isCalculatingStorage,
    clearCache
  };
}
