"use client";

import { useScheduler } from "@/lib/scheduler/use-scheduler";
import { SchedulerSidebarLeft } from "@/components/scheduler/scheduler-sidebar-left";
import { SchedulerCenterPanel } from "@/components/scheduler/scheduler-center-panel";
import { SchedulerRightPanel } from "@/components/scheduler/scheduler-right-panel";
import { SchedulerToolbar } from "@/components/scheduler/scheduler-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function SchedulerWorkspacePage() {
  const schedulerState = useScheduler();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10 pb-16">
          <SchedulerSidebarLeft state={schedulerState} />
          <SchedulerCenterPanel state={schedulerState} />
          <SchedulerRightPanel state={schedulerState} />
        </div>
        
        <SchedulerToolbar state={schedulerState} />
      </div>
    </AppLayout>
  );
}
