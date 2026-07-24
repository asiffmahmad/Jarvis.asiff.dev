"use client";

import { useAnalytics } from "@/lib/analytics/use-analytics";
import { AnalyticsSidebarLeft } from "@/components/analytics/analytics-sidebar-left";
import { AnalyticsCenterPanel } from "@/components/analytics/analytics-center-panel";
import { AnalyticsRightPanel } from "@/components/analytics/analytics-right-panel";
import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function AnalyticsPage() {
  const analyticsState = useAnalytics();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10 pb-16">
          <AnalyticsSidebarLeft state={analyticsState} />
          <AnalyticsCenterPanel state={analyticsState} />
          <AnalyticsRightPanel state={analyticsState} />
        </div>
        
        <AnalyticsToolbar state={analyticsState} />
      </div>
    </AppLayout>
  );
}
