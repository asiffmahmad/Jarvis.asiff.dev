"use client";

import { usePlatforms } from "@/lib/platforms/use-platforms";
import { PlatformsSidebarLeft } from "@/components/platforms/platforms-sidebar-left";
import { PlatformsCenterPanel } from "@/components/platforms/platforms-center-panel";
import { PlatformsRightPanel } from "@/components/platforms/platforms-right-panel";
import { PlatformsToolbar } from "@/components/platforms/platforms-toolbar";
import { AppLayout } from "@/components/layout/app-layout";

export default function PlatformsPage() {
  const platformsState = usePlatforms();

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        
        <div className="flex-1 flex h-full relative z-10 pb-16">
          <PlatformsSidebarLeft state={platformsState} />
          <PlatformsCenterPanel state={platformsState} />
          <PlatformsRightPanel state={platformsState} />
        </div>
        
        <PlatformsToolbar state={platformsState} />
      </div>
    </AppLayout>
  );
}
