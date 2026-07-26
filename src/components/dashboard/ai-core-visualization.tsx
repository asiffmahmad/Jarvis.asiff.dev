"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { AgentNode } from "./agent-node";
import { Brain } from "lucide-react";
import type { AgentsState } from "@/lib/agents/use-agents";

interface Agent {
  id: string;
  name: string;
  isActive: boolean;
}

interface AICoreProps {
  onSelectAgent: (id: string | null) => void;
  selectedAgent: string | null;
  agentsState: AgentsState;
}

// Exactly 8 positions to match the reference image visual layout
const STANDARD_SLOTS = [
  { name: "CONTENT CREATOR", angle: (270 * Math.PI) / 180, defaultId: "content-publisher" },
  { name: "DATA ANALYST", angle: (315 * Math.PI) / 180, defaultId: "data-analyst" },
  { name: "SOCIAL MANAGER", angle: (0 * Math.PI) / 180, defaultId: "social-manager" },
  { name: "SEO OPTIMIZER", angle: (45 * Math.PI) / 180, defaultId: "seo-optimizer" },
  { name: "EMAIL EXPENSE AGENT", angle: (90 * Math.PI) / 180, defaultId: "email-expense-agent" },
  { name: "STRATEGIC PLANNER", angle: (135 * Math.PI) / 180, defaultId: "strategic-planner" },
  { name: "AUTOMATION ENGINE", angle: (180 * Math.PI) / 180, defaultId: "automation-planner" },
  { name: "RESEARCH AGENT", angle: (225 * Math.PI) / 180, defaultId: "research-agent" },
];

const COLORS = ["#00F5D4", "#4CC9F0", "#FFC857", "#FF5C8A", "#38F9A8", "#B200FF"];

// Drifting HUD items configured to slide fully across the dashboard coordinates
const DRIFTING_HUD_ITEMS = [
  { id: 1, text: "SYS_SECTOR_A4", startX: "-15%", endX: "115%", startY: "15%", endY: "20%", duration: 42 },
  { id: 2, text: "NET_LINK_0x89", startX: "115%", endX: "-15%", startY: "25%", endY: "30%", duration: 58 },
  { id: 3, text: "[ TRACER_PORT_OK ]", startX: "12%", endX: "18%", startY: "-15%", endY: "115%", duration: 52 },
  { id: 4, text: "COORD_X: 480.1", startX: "85%", endX: "78%", startY: "115%", endY: "-15%", duration: 64 },
  { id: 5, text: "SYNC_RATIO: 1.00", startX: "-15%", endX: "115%", startY: "82%", endY: "78%", duration: 38 },
  { id: 6, text: "CORE_TEMP_36.8C", startX: "115%", endX: "-15%", startY: "85%", endY: "80%", duration: 48 },
];

export function AICoreVisualization({ onSelectAgent, selectedAgent, agentsState }: AICoreProps) {
  const { executionState, activeAgentId, agents: registryAgents } = agentsState;
  const [dbAgents, setDbAgents] = useState<Agent[]>([]);

  // Fetch agents to coordinate DB matching
  useEffect(() => {
    fetch(`/api/agents/registry?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then((data: Agent[]) => {
        setDbAgents(data.filter(a => a.isActive === true || String(a.isActive) === "1" || String(a.isActive) === "true"));
      })
      .catch(console.error);
  }, [registryAgents.length]);

  const positionedAgents = useMemo(() => {
    return STANDARD_SLOTS.map((slot, i) => {
      // Find matching agent in DB
      const matchingAgent = dbAgents.find(
        (a) =>
          a.name.toUpperCase().replace("-", " ") === slot.name ||
          a.id === slot.defaultId ||
          a.name.toUpperCase().includes(slot.name.split(" ")[0])
      );

      const radiusX = 390; 
      const radiusY = 220; 

      const agentId = matchingAgent?.id || slot.defaultId;
      const isExecuting = agentId === activeAgentId && executionState.status === "running";

      return {
        id: agentId,
        name: slot.name,
        angle: slot.angle,
        x: Math.cos(slot.angle) * radiusX,
        y: Math.sin(slot.angle) * radiusY,
        color: COLORS[i % COLORS.length],
        isExecuting,
        matchingAgent,
      };
    });
  }, [dbAgents, activeAgentId, executionState.status]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#05070a] font-mono select-none">
      {/* Sci-Fi Dot Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `
            radial-gradient(circle, #00F5D4 1.2px, transparent 1.2px),
            linear-gradient(to right, rgba(0,245,212,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,245,212,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 48px 48px, 48px 48px",
          backgroundPosition: "center center",
        }}
      />

      {/* Cyber Sweep Scanline Grid (Hollywood HUD style) */}
      <motion.div 
        className="absolute w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#00E8FF]/20 to-transparent pointer-events-none z-10"
        animate={{ y: ["-45vh", "45vh"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Volumetric Dark Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#05070A_80%)] pointer-events-none z-0" />

      {/* --- DRIFTING CYBER HUD ELEMENTS (Slide fully across the dashboard coordinates) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {DRIFTING_HUD_ITEMS.map((item) => (
          <motion.div
            key={item.id}
            className="absolute flex items-center gap-2 opacity-[0.12]"
            initial={{ left: item.startX, top: item.startY }}
            animate={{ 
              left: [item.startX, item.endX], 
              top: [item.startY, item.endY] 
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-8 h-[1px] bg-[#00E8FF] relative">
              {/* Corner Bracket Cap */}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-1.5 bg-[#00E8FF]" />
            </div>
            <span className="text-[7.5px] text-[#00E8FF] tracking-[0.25em] font-mono font-bold whitespace-nowrap">
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Concentric Scan Rings & Cyber HUD Ticks */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-30">
        {/* Holographic Radar Ring 1 */}
        <motion.div 
          className="absolute w-[760px] h-[760px] rounded-full border border-dashed border-[#00E8FF]/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        />

        {/* Radar Dial Ticks */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full border-[1.5px] border-dashed border-[#00E8FF]/20"
          style={{ strokeDasharray: "4 24" }}
        />

        {/* Diagonal Highlights (Matched Orange Ticks from Reference) */}
        <motion.div 
          className="absolute w-[620px] h-[620px] rounded-full border border-dashed border-[#FF9900]/25"
          style={{ strokeDasharray: "40 180" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {/* Bounded Target Ring (Visual Intercept) */}
        <motion.div 
          className="absolute w-[530px] h-[530px] rounded-full border border-[#FF5C8A]/10 border-t-[#00E8FF]/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Grid Crosshairs */}
        <div className="absolute w-[440px] h-[440px] rounded-full border border-[#00E8FF]/5 flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-[#00E8FF]/8" />
          <div className="absolute h-full w-[1px] bg-[#00E8FF]/8" />
        </div>
      </div>

      {/* --- SVG NEURAL DATA BEAMS & MESH WEB (Matches Reference Colors) --- */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: "visible" }}>
        <g transform="translate(50%, 50%)">
          {/* 1. Draw AGENT-TO-AGENT mesh connections (Matched translucent blue & orange highlights) */}
          {positionedAgents.map((agent, i) => {
            const nextAgent = positionedAgents[(i + 1) % positionedAgents.length];
            
            // Draw a subtle curved arc between neighbors
            const midX = (agent.x + nextAgent.x) * 0.92;
            const midY = (agent.y + nextAgent.y) * 0.92;
            const pathData = `M ${agent.x} ${agent.y} Q ${midX} ${midY} ${nextAgent.x} ${nextAgent.y}`;

            return (
              <g key={`mesh-${agent.id}-${nextAgent.id}`}>
                {/* Glowing mesh line (Muted Cyan/Blue) */}
                <path 
                  d={pathData} 
                  fill="none" 
                  stroke="rgba(0, 232, 255, 0.12)" 
                  strokeWidth="1.2" 
                  strokeDasharray="4 8"
                />
                
                {/* Orange/Amber Mesh Particle Traveler */}
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke="#FFC857"
                  strokeWidth="2"
                  style={{ filter: "drop-shadow(0 0 4px #FFC857)" }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: [0, 1],
                    opacity: [0, 0.7, 0]
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 2
                  }}
                />
              </g>
            );
          })}

          {/* 2. Draw BRAIN-TO-AGENT connections (Electric Cyan & Neon Green highlights) */}
          {positionedAgents.map((agent, i) => {
            const controlPointX = agent.x * 0.45;
            const controlPointY = agent.y * -0.45;
            
            const pathData = `M 0 0 Q ${controlPointX} ${controlPointY} ${agent.x} ${agent.y}`;

            // Left and Right parallel offset curves
            const offsetL = `M -3 -3 Q ${controlPointX - 4} ${controlPointY - 4} ${agent.x - 4} ${agent.y - 4}`;
            const offsetR = `M 3 3 Q ${controlPointX + 4} ${controlPointY + 4} ${agent.x + 4} ${agent.y + 4}`;

            return (
              <g key={`path-${agent.id}`}>
                {/* Double Parallel Conduit Rails (Muted Cyan) */}
                <path 
                  d={offsetL} 
                  fill="none" 
                  stroke={agent.isExecuting ? "#3CF9A0" : "rgba(0,232,255,0.08)"} 
                  strokeWidth="0.8" 
                />
                <path 
                  d={offsetR} 
                  fill="none" 
                  stroke={agent.isExecuting ? "#3CF9A0" : "rgba(0,232,255,0.08)"} 
                  strokeWidth="0.8" 
                />

                {/* Primary Core Neural Beam (Neon Electric Blue/Cyan) */}
                <path 
                  d={pathData} 
                  fill="none" 
                  stroke={agent.isExecuting ? "#3CF9A0" : "#00E8FF"} 
                  strokeWidth={agent.isExecuting ? "2" : "1"} 
                  opacity={agent.isExecuting ? "0.85" : "0.35"} 
                  className="transition-all duration-500"
                />

                {/* Core Outflow Connection Port Indicator */}
                <circle 
                  cx={agent.x * 0.18} 
                  cy={agent.y * 0.18} 
                  r="2.5" 
                  fill={i % 2 === 0 ? "#FF9900" : "#00E8FF"} 
                  opacity="0.7"
                />

                {/* Agent Capsule Connection Port Dot */}
                <circle 
                  cx={agent.x} 
                  cy={agent.y} 
                  r="3.5" 
                  fill={agent.isExecuting ? "#3CF9A0" : "#00E8FF"} 
                  className="animate-pulse"
                  style={{ filter: `drop-shadow(0 0 5px ${agent.isExecuting ? "#3CF9A0" : "#00E8FF"})` }}
                />
                
                {/* Flowing Energy Packets */}
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke={agent.isExecuting ? "#3CF9A0" : (i % 2 === 0 ? "#FFC857" : "#00E8FF")}
                  strokeWidth={agent.isExecuting ? "4.5" : "3"}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${agent.isExecuting ? "#3CF9A0" : (i % 2 === 0 ? "#FFC857" : "#00E8FF")})` }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: [0, 1],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: agent.isExecuting ? 0.65 : 1.7 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 1.2
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* --- THE HOLOGRAPHIC AI CORE --- */}
      <div className="absolute z-20 w-64 h-64 rounded-full flex items-center justify-center pointer-events-none">
        
        {/* Core Volumetric Aura */}
        <motion.div
          className="absolute inset-0 rounded-full blur-[80px]"
          animate={{
            backgroundColor: [
              executionState.status === "running" ? "rgba(60,249,160,0.22)" : "rgba(0,232,255,0.15)",
              executionState.status === "running" ? "rgba(44,203,255,0.32)" : "rgba(44,203,255,0.24)",
              executionState.status === "running" ? "rgba(60,249,160,0.22)" : "rgba(0,232,255,0.15)"
            ],
            scale: executionState.status === "running" ? [1, 1.35, 1] : [1, 1.15, 1]
          }}
          transition={{ duration: executionState.status === "running" ? 1.8 : 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbit Ring 1 */}
        <motion.div
          className="absolute w-52 h-52 rounded-full border border-t-[#00E8FF] border-r-transparent border-b-[#FF5C8A]/30 border-l-transparent opacity-85"
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbit Ring 2 */}
        <motion.div
          className="absolute w-44 h-44 rounded-full border-2 border-r-[#2CCBFF] border-t-transparent border-l-[#FFC857]/50 border-b-transparent opacity-95"
          animate={{ rotate: -360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Central UI Shield Core Container */}
        <div 
          className="relative w-[148px] h-[148px] rounded-full bg-[#070b10]/95 border-[1.5px] flex flex-col items-center justify-center transition-all duration-500"
          style={{
            borderColor: executionState.status === "running" ? "#3CF9A0" : "rgba(0,232,255,0.45)",
            boxShadow: "0 0 35px rgba(0,232,255,0.35), inset 0 0 20px rgba(0,232,255,0.25)"
          }}
        >
          {/* Glass reflections overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent backdrop-blur-md rounded-full pointer-events-none" />

          {/* Brain Hologram */}
          <Brain 
            className="w-11 h-11 text-[#00E8FF] drop-shadow-[0_0_12px_rgba(0,232,255,0.85)] z-10 mb-1" 
          />

          {/* Core Labels matching reference */}
          <span className="text-[10.5px] font-bold text-white tracking-[0.25em] z-10 leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
            JARVIS
          </span>
          <span className="text-[6.5px] font-semibold text-[#2CCBFF] tracking-[0.2em] uppercase z-10 mt-1.5 scale-90">
            AI OPERATIONS CORE
          </span>

          {/* Dynamic Status Dot Indicator */}
          <div className="flex items-center gap-1.5 mt-2.5 text-[6px] font-mono tracking-widest z-10">
            <span className="size-[4.5px] bg-[#3CF9A0] rounded-full animate-ping" />
            <span className="text-[#3CF9A0] font-bold">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

      {/* --- FLOATING HOLOGRAPHIC AGENT MODULES (Capsule Hexagons) --- */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        {positionedAgents.map((agent) => {
          const isSelected = selectedAgent === agent.id;
          const isExecuting = agent.isExecuting;

          return (
            <div 
              key={agent.id} 
              className="absolute pointer-events-auto transition-transform duration-500" 
              style={{ transform: `translate(${agent.x}px, ${agent.y}px)` }}
            >
              {/* Symmetrical target reticle rings */}
              {(isSelected || isExecuting) && (
                <motion.div
                  className="absolute -inset-x-8 -inset-y-4 rounded-full border border-dashed border-[#00E8FF]/30 pointer-events-none"
                  animate={{ rotate: isExecuting ? -360 : 360 }}
                  transition={{ duration: isExecuting ? 3.5 : 8, repeat: Infinity, ease: "linear" }}
                />
              )}

              <AgentNode
                id={agent.id}
                name={agent.name}
                color={isExecuting ? "#3CF9A0" : agent.color}
                x={0}
                y={0}
                isSelected={isSelected}
                isExecuting={isExecuting}
                onClick={() => onSelectAgent(isSelected ? null : agent.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
