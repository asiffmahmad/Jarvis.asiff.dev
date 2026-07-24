"use client";

import { useState } from "react";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { StudioWorkspace } from "@/components/studio/studio-workspace";
import { PreviewPanel } from "@/components/studio/preview-panel";
import type { Platform } from "@/lib/studio/types";
import { AppLayout } from "@/components/layout/app-layout";

export default function StudioPage() {
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [content, setContent] = useState("");
  
  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full bg-jarvis-bg-deepest text-jarvis-text-primary overflow-hidden flex font-sans selection:bg-jarvis-glow-primary/30 relative">
        {/* Background ambient effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-jarvis-glow-primary/5 blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-jarvis-glow-secondary/5 blur-[150px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="relative z-10 flex w-full h-full">
          <StudioSidebar />
          <div className="flex-1 flex overflow-hidden">
            <StudioWorkspace 
              platform={platform} 
              setPlatform={setPlatform}
              content={content}
              setContent={setContent}
            />
            <PreviewPanel platform={platform} content={content} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
