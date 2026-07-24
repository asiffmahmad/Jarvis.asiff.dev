"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AgentNode } from "./agent-node";

const AGENTS = [
  { id: "agent-research", name: "Research Agent", angle: 0 },
  { id: "agent-content", name: "Content Agent", angle: 60 },
  { id: "agent-email", name: "Email Agent", angle: 120 },
  { id: "agent-scheduler", name: "Scheduler Agent", angle: 180 },
  { id: "agent-analytics", name: "Analytics Agent", angle: 240 },
  { id: "agent-automation", name: "Automation Agent", angle: 300 },
];

interface AICoreProps {
  onSelectAgent: (id: string | null) => void;
  selectedAgent: string | null;
}

export function AICoreVisualization({ onSelectAgent, selectedAgent }: AICoreProps) {
  // Simulate rotation over time
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setRotation(r => (r + 0.1) % 360);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden perspective-[1000px]">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,245,208,0.05)_0%,rgba(0,0,0,0)_70%)]" />
      <div 
        className="absolute w-[200%] h-[200%] bg-[url('/grid.svg')] bg-center opacity-10"
        style={{ transform: 'rotateX(60deg) translateY(200px)' }}
      />

      {/* The Central Core */}
      <motion.div
        className="relative z-10 w-48 h-48 rounded-full"
        animate={{
          boxShadow: [
            "0 0 40px rgba(52,245,208,0.2)",
            "0 0 80px rgba(52,245,208,0.4)",
            "0 0 40px rgba(52,245,208,0.2)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-jarvis-primary/10 rounded-full backdrop-blur-md border border-jarvis-primary/30 flex items-center justify-center">
          <motion.div
            className="w-32 h-32 rounded-full border border-jarvis-primary/50 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-jarvis-primary/20 backdrop-blur-xl border border-jarvis-primary/80"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Orbiting Agents */}
      {AGENTS.map((agent) => {
        // Calculate position on a circle
        const rad = ((agent.angle + rotation) * Math.PI) / 180;
        const radius = 280; // Distance from center
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius * 0.6; // Elliptical orbit

        // Scale based on Y position for fake depth
        const scale = 1 + (y / radius) * 0.2;
        const opacity = 0.5 + (y / radius) * 0.5 + 0.5; // Brighter when in front

        return (
          <AgentNode
            key={agent.id}
            id={agent.id}
            name={agent.name}
            x={x}
            y={y}
            scale={scale}
            opacity={Math.min(1, Math.max(0.2, opacity))}
            isSelected={selectedAgent === agent.id}
            onClick={() => onSelectAgent(selectedAgent === agent.id ? null : agent.id)}
          />
        );
      })}

    </div>
  );
}
