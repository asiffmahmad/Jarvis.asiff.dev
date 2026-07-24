"use client";

import { useResearch } from "@/lib/research/use-research";
import { ResearchSidebarLeft } from "@/components/research/research-sidebar-left";
import { ResearchCenterPanel } from "@/components/research/research-center-panel";
import { ResearchRightPanel } from "@/components/research/research-right-panel";
import { ResearchToolbar } from "@/components/research/research-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function ResearchWorkspacePage() {
  const researchState = useResearch();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10 pb-16">
          <ResearchSidebarLeft state={researchState} />
          <ResearchCenterPanel state={researchState} />
          <ResearchRightPanel state={researchState} />
        </div>
        
        <ResearchToolbar state={researchState} />
      </div>
    </AppLayout>
  );
}
