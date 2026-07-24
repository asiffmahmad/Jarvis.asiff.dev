"use client";

import { useAutomation } from "@/lib/automation/use-automation";
import { AutomationSidebarLeft } from "@/components/automation/automation-sidebar-left";
import { AutomationCenterPanel } from "@/components/automation/automation-center-panel";
import { AutomationRightPanel } from "@/components/automation/automation-right-panel";
import { AutomationToolbar } from "@/components/automation/automation-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function AutomationPage() {
  const automationState = useAutomation();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        
        <div className="flex-1 flex h-full relative z-10 pb-16">
          <AutomationSidebarLeft state={automationState} />
          <AutomationCenterPanel state={automationState} />
          <AutomationRightPanel state={automationState} />
        </div>
        
        <AutomationToolbar state={automationState} />
      </div>
    </AppLayout>
  );
}
