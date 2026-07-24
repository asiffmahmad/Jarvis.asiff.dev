"use client";

import { usePrompts } from "@/lib/prompts/use-prompts";
import { PromptsSidebarLeft } from "@/components/prompts/prompts-sidebar-left";
import { PromptsWorkspace } from "@/components/prompts/prompts-workspace";
import { PromptsSidebarRight } from "@/components/prompts/prompts-sidebar-right";
import { PromptsToolbar } from "@/components/prompts/prompts-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function PromptsLibraryPage() {
  const promptState = usePrompts();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Background HUD Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10">
          <PromptsSidebarLeft promptState={promptState} />
          
          <PromptsWorkspace promptState={promptState} />
          
          <PromptsSidebarRight promptState={promptState} />
        </div>

        <PromptsToolbar promptState={promptState} />
      </div>
    </AppLayout>
  );
}
