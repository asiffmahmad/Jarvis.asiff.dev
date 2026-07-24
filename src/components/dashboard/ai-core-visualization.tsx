"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { AgentNode } from "./agent-node";
import { QueueEngine } from "@/lib/scheduler/queue-engine";
import { OAuthService } from "@/lib/platforms/oauth-service";

const METRICS = [
  { id: "metric-posts", label: "Posts Scheduled", getValue: () => QueueEngine.getInstance().getJobs().length, angle: 0 },
  { id: "metric-platforms", label: "Platforms", getValue: () => OAuthService.getInstance().getAccounts().length, angle: 72 },
  { id: "metric-generated", label: "Generated Today", getValue: () => Math.max(1, Math.floor(Math.random() * 20)), angle: 144 },
  { id: "metric-status", label: "System Status", getValue: () => 100, angle: 216 },
  { id: "metric-uptime", label: "Uptime", getValue: () => 99.9, angle: 288 },
];

interface AICoreProps {
  onSelectAgent: (id: string | null) => void;
  selectedAgent: string | null;
}

export function AICoreVisualization({ onSelectAgent, selectedAgent }: AICoreProps) {
  const [rotation, setRotation] = useState(0);
  const [metrics, setMetrics] = useState(METRICS.map(m => ({ id: m.id, label: m.label, value: m.getValue(), angle: m.angle })));
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setRotation(r => (r + 0.08) % 360);
      setPulsePhase(p => (p + 0.02) % (Math.PI * 2));
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    const interval = setInterval(() => {
      setMetrics(METRICS.map(m => ({ id: m.id, label: m.label, value: m.getValue(), angle: m.angle })));
    }, 5000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, []);

  const orbitLines = useMemo(() => {
    return [180, 260, 340].map(radius => (
      <div
        key={radius}
        className="absolute rounded-full border border-jarvis-primary/10"
        style={{
          width: radius * 2,
          height: radius * 2 * 0.6,
          transform: 'translate(-50%, -50%)',
          top: '50%',
          left: '50%',
        }}
      />
    ));
  }, []);

  const coreGlowIntensity = 0.3 + Math.sin(pulsePhase) * 0.15;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden perspective-[1000px]">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,245,208,0.03)_0%,rgba(0,0,0,0)_70%)]" />
      <div 
        className="absolute w-[200%] h-[200%] bg-[url('/grid.svg')] bg-center opacity-5"
        style={{ transform: 'rotateX(60deg) translateY(200px)' }}
      />

      {/* Orbit rings */}
      {orbitLines}

      {/* The Central Core */}
      <motion.div
        className="relative z-10 w-48 h-48 rounded-full"
        animate={{
          boxShadow: [
            `0 0 ${40 + coreGlowIntensity * 40}px rgba(52,245,208,${0.1 + coreGlowIntensity * 0.3})`,
            `0 0 ${60 + coreGlowIntensity * 60}px rgba(52,245,208,${0.15 + coreGlowIntensity * 0.35})`,
            `0 0 ${40 + coreGlowIntensity * 40}px rgba(52,245,208,${0.1 + coreGlowIntensity * 0.3})`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-jarvis-primary/10 rounded-full backdrop-blur-md border border-jarvis-primary/30 flex items-center justify-center">
          <motion.div
            className="w-32 h-32 rounded-full border border-jarvis-primary/50 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-jarvis-primary/20 backdrop-blur-xl border border-jarvis-primary/80 flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-jarvis-primary font-heading text-lg font-bold">AI</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Orbiting Metric Nodes */}
      {metrics.map((metric) => {
        const rad = ((metric.angle + rotation) * Math.PI) / 180;
        const radius = 300;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius * 0.5;
        const scale = 1 + (y / radius) * 0.15;
        const opacity = Math.min(1, Math.max(0.3, 0.5 + (y / radius) * 0.5 + 0.5));

        return (
          <AgentNode
            key={metric.id}
            id={metric.id}
            name={metric.label}
            value={typeof metric.value === 'number' ? metric.value.toString() : metric.value}
            x={x}
            y={y}
            scale={scale}
            opacity={opacity}
            isSelected={selectedAgent === metric.id}
            onClick={() => onSelectAgent(selectedAgent === metric.id ? null : metric.id)}
          />
        );
      })}
    </div>
  );
}
