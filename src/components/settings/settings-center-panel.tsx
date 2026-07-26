"use client";

import { motion } from "framer-motion";
import type { SettingsState } from "@/lib/settings/use-settings";
import type { AppearanceSettings, ProfileSettings } from "@/lib/settings/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CenterPanelProps {
  state: SettingsState;
}

export function SettingsCenterPanel({ state }: CenterPanelProps) {
  const { activeCategory, settings, updateSettings, storageStats, isCalculatingStorage, clearCache } = state;

  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      
      <div className="p-8 border-b border-jarvis-panel/50 flex items-center justify-between bg-jarvis-bg-deepest/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-heading font-bold text-jarvis-text uppercase tracking-widest capitalize">
            {activeCategory.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
          <p className="text-xs text-jarvis-text-muted uppercase tracking-widest mt-2 font-mono">
            Configuration Panel
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-8"
        >
          {/* --- Appearance --- */}
          {activeCategory === 'appearance' && (
            <div className="space-y-6">
              <ConfigGroup title="Theme Preferences">
                <SelectField 
                  label="System Theme" 
                  value={settings.appearance.theme} 
                  options={[
                    { label: 'Dark (Recommended)', value: 'dark' },
                    { label: 'Light', value: 'light' },
                    { label: 'System Match', value: 'system' }
                  ]}
                  onChange={(v) => updateSettings(s => ({ ...s, appearance: { ...s.appearance, theme: v as AppearanceSettings['theme'] } }))}
                />
                <div className="flex items-center justify-between p-3 bg-jarvis-panel/30 rounded border border-jarvis-panel-border/50">
                  <span className="text-sm font-bold text-jarvis-text">Accent Color</span>
                  <div className="flex gap-2">
                    {['#34F5D0', '#F5A623', '#FF4D4D', '#5865F2'].map(c => (
                      <button 
                        key={c}
                        onClick={() => updateSettings(s => ({ ...s, appearance: { ...s.appearance, accentColor: c } }))}
                        className={cn("w-6 h-6 rounded-full border-2", settings.appearance.accentColor === c ? "border-white" : "border-transparent")}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </ConfigGroup>

              <ConfigGroup title="Interface">
                <ToggleField 
                  label="Enable Animations" 
                  checked={settings.appearance.animations} 
                  onChange={(v) => updateSettings(s => ({ ...s, appearance: { ...s.appearance, animations: v } }))} 
                />
                <ToggleField 
                  label="Reduced Motion" 
                  checked={settings.appearance.reducedMotion} 
                  onChange={(v) => updateSettings(s => ({ ...s, appearance: { ...s.appearance, reducedMotion: v } }))} 
                />
              </ConfigGroup>
            </div>
          )}

          {/* --- Profile --- */}
          {activeCategory === 'profile' && (
            <div className="space-y-6">
              <ConfigGroup title="Personal Information">
                <InputField 
                  label="Display Name" 
                  value={settings.profile.name} 
                  onChange={(v) => updateSettings(s => ({ ...s, profile: { ...s.profile, name: v } }))} 
                />
                <InputField 
                  label="Email Address" 
                  value={settings.profile.email} 
                  onChange={(v) => updateSettings(s => ({ ...s, profile: { ...s.profile, email: v } }))} 
                />
              </ConfigGroup>
              <ConfigGroup title="Regional Preferences">
                <SelectField 
                  label="Time Zone" 
                  value={settings.profile.timeZone} 
                  options={[
                    { label: 'UTC', value: 'UTC' },
                    { label: 'America/New_York (EST)', value: 'America/New_York' },
                    { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
                  ]}
                  onChange={(v) => updateSettings(s => ({ ...s, profile: { ...s.profile, timeZone: v } }))}
                />
                <SelectField 
                  label="Time Format" 
                  value={settings.profile.timeFormat} 
                  options={[
                    { label: '24 Hour (14:30)', value: '24h' },
                    { label: '12 Hour (2:30 PM)', value: '12h' },
                  ]}
                  onChange={(v) => updateSettings(s => ({ ...s, profile: { ...s.profile, timeFormat: v as ProfileSettings['timeFormat'] } }))}
                />
              </ConfigGroup>
            </div>
          )}

          {/* --- Security --- */}
          {activeCategory === 'security' && (
            <div className="space-y-6">
              <ConfigGroup title="Authentication">
                <ToggleField 
                  label="Require Multi-Factor Authentication (MFA)" 
                  checked={settings.security.requireMfa} 
                  onChange={(v) => updateSettings(s => ({ ...s, security: { ...s.security, requireMfa: v } }))} 
                />
                <InputField 
                  label="Session Timeout (Minutes)" 
                  value={settings.security.sessionTimeoutMinutes.toString()} 
                  onChange={(v) => updateSettings(s => ({ ...s, security: { ...s.security, sessionTimeoutMinutes: parseInt(v) || 60 } }))} 
                  type="number"
                />
              </ConfigGroup>
              <div className="p-4 bg-jarvis-panel/30 rounded border border-jarvis-panel-border border-dashed text-center">
                <p className="text-sm text-jarvis-text-muted">Password management is handled by your enterprise identity provider.</p>
              </div>
            </div>
          )}

          {/* --- Storage --- */}
          {activeCategory === 'storage' && (
            <div className="space-y-6">
              <ConfigGroup title="Storage Usage">
                {isCalculatingStorage || !storageStats ? (
                  <div className="flex items-center gap-2 p-4 text-jarvis-text-muted">
                    <Loader2 className="size-4 animate-spin" /> Calculating storage footprint...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <StorageBar label="Media Storage" bytes={storageStats.mediaStorageBytes} total={1024 * 1024 * 1024 * 10} color="#34F5D0" />
                    <StorageBar label="Database" bytes={storageStats.databaseUsageBytes} total={1024 * 1024 * 1024 * 10} color="#F5A623" />
                    <StorageBar label="Knowledge Base" bytes={storageStats.knowledgeStorageBytes} total={1024 * 1024 * 1024 * 10} color="#FF4D4D" />
                    <StorageBar label="Cache & Temp" bytes={storageStats.cachedFilesBytes + storageStats.tempFilesBytes} total={1024 * 1024 * 1024 * 10} color="#5865F2" />
                  </div>
                )}
              </ConfigGroup>
              
              <div className="flex justify-end">
                <button 
                  onClick={clearCache}
                  disabled={isCalculatingStorage}
                  className="px-4 py-2 bg-jarvis-panel hover:bg-jarvis-panel-border border border-jarvis-panel-border rounded text-xs font-bold uppercase tracking-widest text-jarvis-text transition-colors disabled:opacity-50"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          )}

          {/* --- Notifications --- */}
          {activeCategory === 'notifications' && (
            <div className="space-y-6">
              <ConfigGroup title="Delivery Channels">
                <ToggleField 
                  label="In-App HUD Notifications" 
                  checked={settings.notifications.inApp} 
                  onChange={(v) => updateSettings(s => ({ ...s, notifications: { ...s.notifications, inApp: v } }))} 
                />
                <ToggleField 
                  label="Email Digest" 
                  checked={settings.notifications.email} 
                  onChange={(v) => updateSettings(s => ({ ...s, notifications: { ...s.notifications, email: v } }))} 
                />
              </ConfigGroup>
              <ConfigGroup title="System Alerts">
                <ToggleField 
                  label="Workflow Completions" 
                  checked={settings.notifications.workflows} 
                  onChange={(v) => updateSettings(s => ({ ...s, notifications: { ...s.notifications, workflows: v } }))} 
                />
                <ToggleField 
                  label="AI Agent Activities" 
                  checked={settings.notifications.agents} 
                  onChange={(v) => updateSettings(s => ({ ...s, notifications: { ...s.notifications, agents: v } }))} 
                />
                <ToggleField 
                  label="Scheduler Events" 
                  checked={settings.notifications.scheduler} 
                  onChange={(v) => updateSettings(s => ({ ...s, notifications: { ...s.notifications, scheduler: v } }))} 
                />
              </ConfigGroup>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

// --- Form Field Helpers ---

function ConfigGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-2">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-jarvis-panel/30 rounded border border-jarvis-panel-border/50">
      <span className="text-sm font-bold text-jarvis-text">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={cn(
          "w-10 h-5 rounded-full p-1 transition-colors",
          checked ? "bg-jarvis-primary" : "bg-jarvis-panel-border"
        )}
      >
        <div className={cn(
          "w-3 h-3 rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-jarvis-panel/30 rounded border border-jarvis-panel-border/50">
      <span className="text-sm font-bold text-jarvis-text">{label}</span>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-jarvis-bg border border-jarvis-panel-border rounded px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary"
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string, value: string, options: {label: string, value: string}[], onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-jarvis-panel/30 rounded border border-jarvis-panel-border/50">
      <span className="text-sm font-bold text-jarvis-text">{label}</span>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-jarvis-bg border border-jarvis-panel-border rounded px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-primary"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function StorageBar({ label, bytes, total, color }: { label: string, bytes: number, total: number, color: string }) {
  const percent = Math.max(1, (bytes / total) * 100);
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-jarvis-text">{label}</span>
        <span className="text-jarvis-text-muted">{mb} MB</span>
      </div>
      <div className="h-1.5 w-full bg-jarvis-panel-border/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
