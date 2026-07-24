"use client";

import { useIntegrations } from "@/lib/integrations/use-integrations";
import { IntegrationsSidebarLeft } from "@/components/integrations/integrations-sidebar-left";
import { IntegrationsCenterPanel } from "@/components/integrations/integrations-center-panel";
import { IntegrationsRightPanel } from "@/components/integrations/integrations-right-panel";
import { IntegrationsToolbar } from "@/components/integrations/integrations-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function IntegrationsPage() {
  const integrationsState = useIntegrations();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        
        <div className="flex-1 flex h-full relative z-10 pb-16">
          <IntegrationsSidebarLeft state={integrationsState} />
          <IntegrationsCenterPanel state={integrationsState} />
          <IntegrationsRightPanel state={integrationsState} />
        </div>
        
        <IntegrationsToolbar state={integrationsState} />
      </div>
    </AppLayout>
  );
}
