"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { SystemHealthWidget } from "@/components/dashboard/widgets/system-health-widget";
import { AIStatusWidget } from "@/components/dashboard/widgets/ai-status-widget";
import { QuickActionsWidget } from "@/components/dashboard/widgets/quick-actions-widget";
import { LatestResearchWidget } from "@/components/dashboard/widgets/latest-research-widget";
import { AutomationStatusWidget } from "@/components/dashboard/widgets/automation-status-widget";
import { ConnectedServicesWidget } from "@/components/dashboard/widgets/connected-services-widget";
import { ScheduleWidget } from "@/components/dashboard/widgets/schedule-widget";
import { AnalyticsPreviewWidget } from "@/components/dashboard/widgets/analytics-preview-widget";
import { ActivityWidget } from "@/components/dashboard/widgets/activity-widget";
import { EmailSummaryWidget } from "@/components/dashboard/widgets/email-summary-widget";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="h-full w-full overflow-y-auto bg-jarvis-bg p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow">
              Dashboard Overview
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="space-y-6">
              <SystemHealthWidget isLoading={false} />
              <AIStatusWidget isLoading={false} />
              <QuickActionsWidget />
            </div>
            
            <div className="space-y-6">
              <LatestResearchWidget isLoading={false} />
              <AutomationStatusWidget isLoading={false} />
              <ConnectedServicesWidget isLoading={false} />
              <EmailSummaryWidget isLoading={false} />
            </div>

            <div className="space-y-6">
              <ScheduleWidget isLoading={false} />
              <AnalyticsPreviewWidget isLoading={false} />
              <ActivityWidget isLoading={false} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
