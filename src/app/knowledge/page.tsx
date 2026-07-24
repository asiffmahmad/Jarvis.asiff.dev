"use client";

import { useKnowledge } from "@/lib/knowledge/use-knowledge";
import { KnowledgeSidebarLeft } from "@/components/knowledge/knowledge-sidebar-left";
import { KnowledgeCenterPanel } from "@/components/knowledge/knowledge-center-panel";
import { KnowledgeEditor } from "@/components/knowledge/knowledge-editor";
import { KnowledgeRightPanel } from "@/components/knowledge/knowledge-right-panel";
import { KnowledgeToolbar } from "@/components/knowledge/knowledge-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function KnowledgeHubPage() {
  const knowledgeState = useKnowledge();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Abstract Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10 pb-16">
          <KnowledgeSidebarLeft state={knowledgeState} />
          
          {/* Main Layout: List vs Editor */}
          {knowledgeState.activeItemId ? (
            <KnowledgeEditor state={knowledgeState} />
          ) : (
            <>
              <KnowledgeCenterPanel state={knowledgeState} />
              <KnowledgeRightPanel state={knowledgeState} />
            </>
          )}
        </div>
        
        <KnowledgeToolbar state={knowledgeState} />
      </div>
    </AppLayout>
  );
}
