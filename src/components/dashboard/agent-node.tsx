"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  PenTool, BarChart3, Users, TrendingUp, Mail, Target, Settings, Search, Cpu 
} from "lucide-react";

interface AgentNodeProps {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  isSelected: boolean;
  isExecuting: boolean;
  statusText?: string;
  onClick: () => void;
}

function getAgentIcon(name: string) {
  const n = name.toUpperCase();
  if (n.includes("CONTENT") || n.includes("PUBLISHER") || n.includes("CREATOR")) return PenTool;
  if (n.includes("DATA") || n.includes("ANALYST")) return BarChart3;
  if (n.includes("SOCIAL") || n.includes("MANAGER")) return Users;
  if (n.includes("SEO") || n.includes("OPTIMIZER")) return TrendingUp;
  if (n.includes("EMAIL") || n.includes("EXPENSE")) return Mail;
  if (n.includes("STRATEGIC") || n.includes("PLANNER")) return Target;
  if (n.includes("AUTOMATION") || n.includes("ENGINE")) return Settings;
  if (n.includes("RESEARCH") || n.includes("SEARCH")) return Search;
  return Cpu;
}

export function AgentNode({ id, name, color, x, y, isSelected, isExecuting, statusText, onClick }: AgentNodeProps) {
  const IconComponent = getAgentIcon(name);

  // Determine status dot color
  let statusColor = "bg-[#4CC9F0]"; 
  let statusDotColor = "text-[#4CC9F0]";
  let status = statusText || "STANDBY";

  if (isExecuting) {
    status = "ACTIVE";
    statusColor = "bg-[#3CF9A0]";
    statusDotColor = "text-[#3CF9A0]";
  } else if (name.toUpperCase().includes("RESEARCH") || name.toUpperCase().includes("DATA")) {
    status = "READY";
    statusColor = "bg-[#3CF9A0]";
    statusDotColor = "text-[#3CF9A0]";
  } else if (name.toUpperCase().includes("AUTOMATION") || name.toUpperCase().includes("SEO")) {
    status = "IDLE";
    statusColor = "bg-gray-500";
    statusDotColor = "text-gray-500";
  }

  // Polygon path for cut-corner sci-fi hexagonal capsule
  const clipPathStyle = {
    clipPath: "polygon(14% 0%, 86% 0%, 100% 30%, 100% 70%, 86% 100%, 14% 100%, 0% 70%, 0% 30%)"
  };

  return (
    <motion.div
      className="absolute cursor-pointer group z-20"
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      onClick={onClick}
      animate={{ y: [y - 4, y + 4, y - 4] }}
      transition={{ 
        duration: 5 + Math.random() * 2, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay: Math.random() * 1.5
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Volumetric Radial Light Glow behind the node capsule */}
        <div 
          className={cn(
            "absolute -inset-6 rounded-full blur-2xl transition-all duration-700 pointer-events-none opacity-20",
            isSelected ? "opacity-55 scale-110" : "group-hover:opacity-30"
          )}
          style={{ backgroundColor: color }}
        />

        {/* Double-border Hexagonal Tapered Capsule */}
        <div 
          className="relative w-[184px] h-[84px] p-[1.5px] transition-all duration-500 flex items-center justify-center"
          style={{
            ...clipPathStyle,
            background: isSelected 
              ? "linear-gradient(135deg, #00E8FF 0%, rgba(0,232,255,0.2) 50%, #00E8FF 100%)" 
              : "linear-gradient(135deg, rgba(0,232,255,0.3) 0%, rgba(0,255,255,0.05) 50%, rgba(0,232,255,0.3) 100%)",
            filter: isSelected ? "drop-shadow(0 0 12px rgba(0,232,255,0.4))" : "none"
          }}
        >
          {/* Inner Content Card (offset slightly to create thin border) */}
          <div 
            className="absolute inset-[1.5px] bg-gradient-to-b from-[#0c1420] to-[#04080f] flex flex-col items-center justify-center"
            style={clipPathStyle}
          >
            {/* Top Gloss Light Reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

            {/* Glowing Corner Accents (Corner Lights) */}
            <span className="absolute top-0 left-[14%] w-1.5 h-[1.5px] bg-[#00E8FF]/60" />
            <span className="absolute top-0 right-[14%] w-1.5 h-[1.5px] bg-[#00E8FF]/60" />
            <span className="absolute bottom-0 left-[14%] w-1.5 h-[1.5px] bg-[#00E8FF]/60" />
            <span className="absolute bottom-0 right-[14%] w-1.5 h-[1.5px] bg-[#00E8FF]/60" />

            {/* Circular Icon Container */}
            <div 
              className="size-[34px] rounded-full border flex items-center justify-center bg-black/60 shadow-[0_0_12px_rgba(0,0,0,0.6)] z-10 transition-all duration-500 -translate-y-1"
              style={{ 
                borderColor: isSelected ? "#00E8FF" : "rgba(0,255,255,0.22)",
                boxShadow: isSelected ? "0 0 10px rgba(0,232,255,0.25)" : "none"
              }}
            >
              <IconComponent 
                className="size-4 text-[#00E8FF] drop-shadow-[0_0_5px_rgba(0,232,255,0.6)]" 
              />
            </div>

            {/* Agent Title */}
            <span className="text-[9.5px] font-bold text-white tracking-[0.2em] whitespace-nowrap mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
              {name}
            </span>

            {/* Status Dot */}
            <div className="flex items-center gap-1.5 mt-1 text-[7.5px] font-mono tracking-widest">
              <span className={cn("size-1 bg-[#3CF9A0] rounded-full", statusColor)} />
              <span className={cn("font-bold", statusDotColor)}>{status}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
