"use client";

import { useResearch } from "@/lib/research/use-research";
import { ResearchSidebarLeft } from "@/components/research/research-sidebar-left";
import { ResearchCenterPanel } from "@/components/research/research-center-panel";
import { ResearchRightPanel } from "@/components/research/research-right-panel";
import { ResearchToolbar } from "@/components/research/research-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function ResearchPage() {
  const researchState = useResearch();

  return (
    <AppLayout edgeToEdge>
      <div className="flex h-full w-full bg-jarvis-bg overflow-hidden text-jarvis-text relative">
        <ResearchSidebarLeft state={researchState} />
        <ResearchCenterPanel state={researchState} />
        <ResearchRightPanel state={researchState} />
        <ResearchToolbar state={researchState} />
      </div>
    </AppLayout>
  );
}
