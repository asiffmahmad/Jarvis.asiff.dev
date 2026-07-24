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
      <div className="flex h-full w-full bg-jarvis-bg overflow-hidden text-jarvis-text relative">
        <AgentsSidebarLeft state={agentsState} />
        <AgentsCenterPanel state={agentsState} />
        <AgentsRightPanel state={agentsState} />
        <AgentsToolbar state={agentsState} />
      </div>
    </AppLayout>
  );
}
