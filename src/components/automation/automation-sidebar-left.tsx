"use client";

import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Zap, Network, Settings, Brain } from "lucide-react";
import type { AutomationState } from "@/lib/automation/use-automation";
import type { NodeType } from "@/lib/automation/types";

interface SidebarProps {
  state: AutomationState;
}

const NODE_TYPES: { id: NodeType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'trigger', label: 'Triggers', icon: Play, color: '#34F5D0' },
  { id: 'action', label: 'Actions', icon: Zap, color: '#F5A623' },
  { id: 'condition', label: 'Conditions', icon: Network, color: '#E834F5' },
  { id: 'utility', label: 'Utilities', icon: Settings, color: '#A3A3A3' },
  { id: 'ai', label: 'AI Agents', icon: Brain, color: '#34A4F5' },
];

export function AutomationSidebarLeft({}: SidebarProps) {
  
  const onDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg">
          Nodes
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          Drag to Canvas
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        
        {NODE_TYPES.map((category) => (
          <div key={category.id} className="mb-6">
            <h3 className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <category.icon className="size-3" style={{ color: category.color }} /> {category.label}
            </h3>
            
            <div className="space-y-2">
              <NodeDraggable onDragStart={onDragStart} type={category.id} label={`${category.label} Node 1`} />
              <NodeDraggable onDragStart={onDragStart} type={category.id} label={`${category.label} Node 2`} />
            </div>
          </div>
        ))}

      </ScrollArea>
    </motion.aside>
  );
}

function NodeDraggable({ 
  onDragStart, 
  type, 
  label 
}: { 
  onDragStart: (e: React.DragEvent, t: NodeType, l: string) => void;
  type: NodeType;
  label: string;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type, label)}
      className="p-3 bg-jarvis-panel/30 border border-jarvis-panel-border/50 rounded-lg cursor-grab hover:bg-jarvis-panel/50 hover:border-jarvis-panel-border transition-colors text-xs font-bold text-jarvis-text"
    >
      {label}
    </div>
  );
}
