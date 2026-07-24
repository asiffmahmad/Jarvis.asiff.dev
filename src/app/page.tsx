"use client";

import { useState, useEffect } from "react";
import { DashboardLeftPanel } from "@/components/dashboard/dashboard-left-panel";
import { DashboardRightPanel } from "@/components/dashboard/dashboard-right-panel";
import { DashboardConsole } from "@/components/dashboard/dashboard-console";
import { AICoreVisualization } from "@/components/dashboard/ai-core-visualization";
import { globalEventBus, SystemEventType } from "@/lib/events/event-bus";
import { APP_CONFIG } from "@/config/app.config";
import { AppLayout } from "@/components/layout/app-layout";

export default function MissionControlPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Mock Event Generator to make the dashboard feel alive
  useEffect(() => {
    const agents = Object.values(APP_CONFIG.agents);
    const actions = [
      { type: "agent:thinking", msg: "Analyzing intent..." },
      { type: "agent:executing", msg: "Writing to Shared Memory" },
      { type: "tool:called", msg: "Calling PostgresDB" },
      { type: "data:read", msg: "Reading context window" },
      { type: "agent:completed", msg: "Task finished successfully." }
    ];

    const interval = setInterval(() => {
      // Pick a random agent and random action
      const agent = agents[Math.floor(Math.random() * agents.length)];
      
      // 5% chance of an alert or workflow event
      if (Math.random() > 0.95) {
        globalEventBus.publish("workflow:started", "System", "Triggered scheduled workflow: Daily Briefing");
      } else if (Math.random() > 0.98) {
        globalEventBus.publish("system:alert", "System", "High memory usage detected on Research Agent");
      } else {
        const action = actions[Math.floor(Math.random() * actions.length)];
        globalEventBus.publish(action.type as SystemEventType, agent, action.msg);
      }
    }, 2000); // Fire an event every 2 seconds

    // Initial boot events
    globalEventBus.publish("system:ready", "System", `${APP_CONFIG.name} Online.`);
    globalEventBus.publish("agent:started", "agent-scheduler", "Scheduler daemon running.");

    return () => clearInterval(interval);
  }, []);

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
