"use client";

import { useSchedulerCalendar } from "@/lib/scheduler-calendar/use-scheduler-calendar";
import { SchedulerCalendarSidebarLeft } from "@/components/scheduler-calendar/scheduler-calendar-sidebar-left";
import { SchedulerCalendarCenterPanel } from "@/components/scheduler-calendar/scheduler-calendar-center-panel";
import { SchedulerCalendarRightPanel } from "@/components/scheduler-calendar/scheduler-calendar-right-panel";
import { SchedulerCalendarToolbar } from "@/components/scheduler-calendar/scheduler-calendar-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function SchedulerWorkspacePage() {
  const schedulerCalendarState = useSchedulerCalendar();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10 pb-16">
          <SchedulerCalendarSidebarLeft state={schedulerCalendarState} />
          <SchedulerCalendarCenterPanel state={schedulerCalendarState} />
          <SchedulerCalendarRightPanel state={schedulerCalendarState} />
        </div>

        <SchedulerCalendarToolbar state={schedulerCalendarState} />
      </div>
    </AppLayout>
  );
}
