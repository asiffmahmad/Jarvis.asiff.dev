"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Cpu } from "lucide-react";

interface AgentNodeProps {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
}

export function AgentNode({ id, name, color, x, y, isSelected, onClick }: AgentNodeProps) {
  return (
    <motion.div
      className="absolute cursor-pointer group z-20"
      style={{ x, y }}
      onClick={onClick}
      animate={{ y: [y - 8, y + 8, y - 8] }}
      transition={{ 
        duration: 4 + Math.random() * 2, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay: Math.random() * 2 
      }}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Glowing Aura (Only visible on hover/select) */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full blur-xl transition-opacity duration-500",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
          )}
          style={{ backgroundColor: color }}
        />

        {/* The Node */}
        <div 
          className={cn(
            "relative w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 z-10",
            isSelected ? "scale-125" : "hover:scale-110"
          )}
          style={{
            borderColor: isSelected ? color : `${color}40`,
            backgroundColor: isSelected ? `${color}20` : `rgba(0,0,0,0.4)`,
            backdropFilter: "blur(10px)",
            boxShadow: isSelected ? `0 0 20px ${color}80, inset 0 0 15px ${color}60` : `0 0 10px ${color}30`,
          }}
        >
          <Cpu className="w-5 h-5" style={{ color: isSelected ? '#fff' : color }} />
        </div>

        {/* Label */}
        <div className="absolute top-[60px] w-max text-center pointer-events-none z-20">
          <div 
            className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-xl border transition-colors duration-300"
            style={{ 
              color: isSelected ? '#fff' : '#a1a1aa',
              borderColor: isSelected ? `${color}60` : 'rgba(255,255,255,0.05)',
              boxShadow: isSelected ? `0 4px 20px ${color}40` : 'none'
            }}
          >
            {name}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
