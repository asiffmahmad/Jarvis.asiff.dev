"use client";

import { useState } from "react";
import { useAgents } from "@/lib/agents/use-agents";
import { AgentsSidebarLeft } from "@/components/agents/agents-sidebar-left";
import { AgentsCenterPanel } from "@/components/agents/agents-center-panel";
import { AgentsRightPanel } from "@/components/agents/agents-right-panel";
import { AgentsToolbar } from "@/components/agents/agents-toolbar";
import { AppLayout } from "@/components/layout/app-layout";
import { getResearchContext } from "@/lib/cross-page-store";

export default function AgentsPage() {
  const agentsState = useAgents();
  const [mode, setMode] = useState<"agent" | "post" | "pipeline">(() => {
    return "pipeline"; // Default to pipeline screen
  });

  return (
    <AppLayout edgeToEdge>
      <div className="flex h-full w-full bg-jarvis-bg overflow-hidden text-jarvis-text relative">
        {mode !== "pipeline" && <AgentsSidebarLeft state={agentsState} mode={mode} />}
        <AgentsCenterPanel state={agentsState} mode={mode} setMode={setMode} />
        {mode !== "pipeline" && <AgentsRightPanel state={agentsState} />}
        <AgentsToolbar state={agentsState} mode={mode} />
      </div>
    </AppLayout>
  );
}
