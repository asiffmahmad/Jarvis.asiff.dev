"use client";

import { useState } from "react";
import { DashboardLeftPanel } from "@/components/dashboard/dashboard-left-panel";
import { DashboardRightPanel } from "@/components/dashboard/dashboard-right-panel";
import { DashboardConsole } from "@/components/dashboard/dashboard-console";
import { AICoreVisualization } from "@/components/dashboard/ai-core-visualization";
import { AppLayout } from "@/components/layout/app-layout";

export default function MissionControlPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <AppLayout edgeToEdge>
      <div className="flex h-full w-full bg-jarvis-bg overflow-hidden text-jarvis-text selection:bg-jarvis-primary/30">
        
        {/* 1. Left Telemetry Panel */}
        <DashboardLeftPanel />

        {/* 2. Center Canvas (The AI Core) */}
        <main className="flex-[2] relative h-full flex flex-col items-center justify-center bg-jarvis-bg-deepest/50">
          <div className="absolute top-8 left-8 z-20">
            <h1 className="text-2xl font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow drop-shadow-[0_0_15px_rgba(52,245,208,0.5)]">
              Mission Control
            </h1>
            <p className="text-xs text-jarvis-text-muted mt-2 uppercase tracking-widest font-mono">
              System Status: Nominal
            </p>
          </div>

          <AICoreVisualization onSelectAgent={setSelectedAgent} selectedAgent={selectedAgent} />

          {/* 4. Bottom Console */}
          <DashboardConsole />
        </main>

      {/* 3. Right Inspector Panel */}
      <DashboardRightPanel selectedAgent={selectedAgent} />

      </div>
    </AppLayout>
  );
}
