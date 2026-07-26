"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { AgentNode } from "./agent-node";
import { Brain, Activity, Terminal } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  isActive: boolean;
}

interface AICoreProps {
  onSelectAgent: (id: string | null) => void;
  selectedAgent: string | null;
}

const COLORS = ["#FF3366", "#00E5FF", "#FFD500", "#B200FF", "#00FF66", "#FF9900", "#34F5D0"];

// Fake logs for the live terminal HUD
const FAKE_LOGS = [
  "[SYS] Kernel booted. Nominal.",
  "[NET] Quantum routing enabled...",
  "[AI] Synapse calibration: 99.9%",
  "[WARN] High packet volume detected.",
  "[SEC] Encryption layer 7 active.",
  "[NODE] JARVIS handshake complete.",
  "[DB] Indexing 1,402 new vectors...",
];

export function AICoreVisualization({ onSelectAgent, selectedAgent }: AICoreProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [wave, setWave] = useState<number[]>([20, 40, 80, 40, 20, 60, 90, 50, 30, 70]);

  useEffect(() => {
    fetch("/api/agents/registry")
      .then(r => r.json())
      .then((data: Agent[]) => setAgents(data.filter(a => a.isActive)))
      .catch(console.error);

    // Terminal log generator
    const logInterval = setInterval(() => {
      setLogs(prev => {
        const newLog = FAKE_LOGS[Math.floor(Math.random() * FAKE_LOGS.length)];
        const ts = new Date().toISOString().split('T')[1].slice(0, 8);
        const logLine = `${ts} > ${newLog}`;
        return [...prev.slice(-6), logLine];
      });
    }, 1500);

    // Waveform generator
    const waveInterval = setInterval(() => {
      setWave(prev => prev.map(() => Math.floor(Math.random() * 100)));
    }, 400);

    return () => {
      clearInterval(logInterval);
      clearInterval(waveInterval);
    };
  }, []);

  const positionedAgents = useMemo(() => {
    return agents.map((agent, i) => {
      const angle = (i / agents.length) * Math.PI * 2;
      const radiusX = 380; // Pushed out to make room for rings
      const radiusY = 220; 
      return {
        ...agent,
        x: Math.cos(angle) * radiusX,
        y: Math.sin(angle) * radiusY,
        color: COLORS[i % COLORS.length]
      };
    });
  }, [agents]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-jarvis-bg-deepest font-mono select-none">
      
      {/* Background Dark Noise */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,245,208,0.08)_0%,rgba(0,0,0,0.9)_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* --- FLOATING COCKPIT HUDs --- */}
      
      {/* Top Anchor: Global System Status */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-8 z-30 pointer-events-none">
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-[#00E5FF]/70 tracking-[0.3em]">CORE TEMP</span>
          <span className="text-xs text-[#00E5FF] font-bold">34.2°C</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-[#FF9900]/70 tracking-[0.3em]">SYSTEM STATE</span>
          <span className="text-xs text-[#FF9900] font-bold animate-pulse">LOCKED & SECURE</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-[#34F5D0]/70 tracking-[0.3em]">UPTIME</span>
          <span className="text-xs text-[#34F5D0] font-bold">99.999%</span>
        </div>
      </div>

      {/* Left HUD: Network Waveform */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 w-48 p-4 rounded-xl bg-black/40 border border-[#00E5FF]/20 backdrop-blur-md z-30 pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="size-4 text-[#00E5FF]" />
          <span className="text-[10px] text-[#00E5FF] tracking-[0.2em] font-bold">NET_LOAD</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {wave.map((h, i) => (
            <div key={i} className="flex-1 bg-[#00E5FF]/50 transition-all duration-300 rounded-t-sm" style={{ height: `${Math.max(10, h)}%` }} />
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-[#00E5FF]/20 flex justify-between">
          <span className="text-[9px] text-[#00E5FF]/60">THROUGHPUT</span>
          <span className="text-[9px] text-[#00E5FF]">{(wave[0] * 12).toFixed(1)} GB/s</span>
        </div>
      </div>

      {/* Right HUD: Live Terminal */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 p-4 rounded-xl bg-black/40 border border-[#FF9900]/20 backdrop-blur-md z-30 pointer-events-none shadow-[0_0_20px_rgba(255,153,0,0.05)]">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="size-4 text-[#FF9900]" />
          <span className="text-[10px] text-[#FF9900] tracking-[0.2em] font-bold">LIVE_STREAM</span>
        </div>
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-[9px] text-[#FF9900]/80 whitespace-nowrap overflow-hidden">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* --- HOLOGRAPHIC DATA RINGS --- */}
      
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-40">
        {/* Ring 1 (Outer) */}
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full border border-dashed border-[#00E5FF]/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          {/* Degree Markers */}
          {['0°', '90°', '180°', '270°'].map((deg, i) => (
            <div key={deg} className="absolute text-[8px] text-[#00E5FF] -translate-x-1/2 -translate-y-1/2"
                 style={{ 
                   top: i === 0 ? '-15px' : i === 2 ? '615px' : '50%',
                   left: i === 3 ? '-15px' : i === 1 ? '615px' : '50%',
                   transform: `translate(-50%, -50%) rotate(${-i * 90}deg)`
                 }}>
              {deg}
            </div>
          ))}
        </motion.div>

        {/* Ring 2 (Middle) */}
        <motion.div 
          className="absolute w-[480px] h-[480px] rounded-full border-[2px] border-dotted border-[#FF9900]/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />

        {/* Ring 3 (Inner Target) */}
        <motion.div 
          className="absolute w-[360px] h-[360px] rounded-full border border-[#34F5D0]/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {/* Crosshairs */}
          <div className="absolute top-0 bottom-0 w-[1px] bg-[#34F5D0]/30" />
          <div className="absolute left-0 right-0 h-[1px] bg-[#34F5D0]/30" />
        </motion.div>
      </div>

      {/* --- SVG NEURAL BEAMS --- */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: "visible" }}>
        <g transform="translate(50%, 50%)">
          {positionedAgents.map((agent) => {
            const controlPointX = agent.x * 0.4;
            const controlPointY = agent.y * -0.4; // Sharp arc
            const pathData = `M 0 0 Q ${controlPointX} ${controlPointY} ${agent.x} ${agent.y}`;

            return (
              <g key={`path-${agent.id}`}>
                {/* Thick glowing static beam */}
                <path d={pathData} fill="none" stroke={agent.color} strokeWidth="2" opacity="0.15" />
                
                {/* Intense Data Packet */}
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke={agent.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 10px ${agent.color})` }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: [0, 1],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    repeat: Infinity,
                    ease: "circOut",
                    delay: Math.random() * 2
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* --- THE SYNAPTIC CORE --- */}
      <div className="absolute z-20 w-48 h-48 rounded-full flex items-center justify-center pointer-events-none">
        
        {/* Core Breathing Glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-[60px]"
          animate={{
            backgroundColor: ["rgba(0,229,255,0.15)", "rgba(0,229,255,0.3)", "rgba(0,229,255,0.15)"],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Technical Ring */}
        <motion.div
          className="absolute w-36 h-36 rounded-full border-4 border-t-[#00E5FF] border-r-transparent border-b-[#FF9900] border-l-transparent opacity-80"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner Solid Core */}
        <div className="relative w-20 h-20 rounded-full bg-black border-2 border-[#00E5FF] flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.4)]">
          <motion.div 
            className="absolute inset-0 bg-[#00E5FF]/20 backdrop-blur-md"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <Brain className="w-8 h-8 text-[#00E5FF] relative z-10" />
        </div>
      </div>

      {/* --- FLOATING AGENT NODES --- */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        {positionedAgents.map((agent) => (
          <AgentNode
            key={agent.id}
            id={agent.id}
            name={agent.name}
            color={agent.color}
            x={agent.x}
            y={agent.y}
            isSelected={selectedAgent === agent.id}
            onClick={() => onSelectAgent(selectedAgent === agent.id ? null : agent.id)}
          />
        ))}
      </div>
    </div>
  );
}
