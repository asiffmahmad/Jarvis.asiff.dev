"use client";

import { useAgents } from "@/lib/agents/use-agents";
import { AgentsSidebarLeft } from "@/components/agents/agents-sidebar-left";
import { AgentsCenterPanel } from "@/components/agents/agents-center-panel";
import { AgentsRightPanel } from "@/components/agents/agents-right-panel";
import { AgentsToolbar } from "@/components/agents/agents-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function AgentsPage() {
  const agentsState = useAgents();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        
        <div className="flex-1 flex h-full relative z-10 pb-16">
          <AgentsSidebarLeft state={agentsState} />
          <AgentsCenterPanel state={agentsState} />
          <AgentsRightPanel state={agentsState} />
        </div>
        
        <AgentsToolbar state={agentsState} />
      </div>
    </AppLayout>
  );
}
