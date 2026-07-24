"use client";

import { useMedia } from "@/lib/media/use-media";
import { MediaSidebarLeft } from "@/components/media/media-sidebar-left";
import { MediaWorkspace } from "@/components/media/media-workspace";
import { MediaSidebarRight } from "@/components/media/media-sidebar-right";
import { MediaToolbar } from "@/components/media/media-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function MediaLibraryPage() {
  const mediaState = useMedia();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Background HUD Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10">
          <MediaSidebarLeft />
          
          <MediaWorkspace mediaState={mediaState} />
          
          <MediaSidebarRight mediaState={mediaState} />
        </div>

        <MediaToolbar />
      </div>
    </AppLayout>
  );
}
