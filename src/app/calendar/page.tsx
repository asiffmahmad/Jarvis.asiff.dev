"use client";

import { useCalendar } from "@/lib/calendar/use-calendar";
import { CalendarSidebarLeft } from "@/components/calendar/calendar-sidebar-left";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarRightPanel } from "@/components/calendar/calendar-right-panel";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function CalendarWorkspacePage() {
  const calendarState = useCalendar();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Background Neon Grid for Calendar feel */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />

        <div className="flex-1 flex h-full relative z-10 pb-16">
          <CalendarSidebarLeft state={calendarState} />
          <CalendarGrid state={calendarState} />
          <CalendarRightPanel state={calendarState} />
        </div>
        
        <CalendarToolbar state={calendarState} />
      </div>
    </AppLayout>
  );
}
