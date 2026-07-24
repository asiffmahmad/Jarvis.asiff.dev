"use client";

import { useSettings } from "@/lib/settings/use-settings";
import { SettingsSidebarLeft } from "@/components/settings/settings-sidebar-left";
import { SettingsCenterPanel } from "@/components/settings/settings-center-panel";
import { SettingsRightPanel } from "@/components/settings/settings-right-panel";
import { SettingsToolbar } from "@/components/settings/settings-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function SettingsPage() {
  const settingsState = useSettings();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        
        <div className="flex-1 flex h-full relative z-10 pb-16">
          <SettingsSidebarLeft state={settingsState} />
          <SettingsCenterPanel state={settingsState} />
          <SettingsRightPanel state={settingsState} />
        </div>
        
        <SettingsToolbar state={settingsState} />
      </div>
    </AppLayout>
  );
}
