"use client";

import { motion } from "framer-motion";
import { Bot, Search, PenTool, Mail, Hash, Rocket, Code2, Network, BookOpen, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AgentsState } from "@/lib/agents/use-agents";
import type { AgentCategory } from "@/lib/agents/types";

interface SidebarProps {
  state: AgentsState;
  mode: "agent" | "post" | "pipeline";
}

const getIconForCategory = (category: AgentCategory) => {
  switch (category) {
    case 'research': return Search;
    case 'content': return PenTool;
    case 'email': return Mail;
    case 'social': return Hash;
    case 'seo': return Rocket;
    case 'coding': return Code2;
    case 'automation': return Network;
    case 'support': return BookOpen;
    default: return Bot;
  }
};

export function AgentsSidebarLeft({ state, mode }: SidebarProps) {
  const { agents, activeAgentId, setActiveAgentId } = state;

  const enabledAgents = agents.filter(a => a.isEnabled);

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg">
          Agents
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          Swarm Intelligence
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        {mode === "pipeline" ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-50 py-16">
            <Bot className="size-10 text-jarvis-text-muted mb-2 animate-pulse" />
            <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Roster Suspended</span>
            <p className="text-[9px] text-jarvis-text-muted/70 mt-1 leading-relaxed">
              Active roster selection is disabled during Multi-Agent Pipeline operations.
            </p>
          </div>
        ) : (
          <div className="space-y-1 mb-6 mt-2">
            <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
              <Play className="size-3 text-[#34F5D0]" /> Active Roster
            </h3>
            {enabledAgents.map((agent) => {
              const isSelected = activeAgentId === agent.id;
              const Icon = getIconForCategory(agent.category);
              
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={cn(
                    "w-full flex flex-col gap-1 p-3 rounded-lg transition-all duration-300 group text-left",
                    isSelected
                      ? "bg-jarvis-primary/10 border border-jarvis-primary/30 shadow-[inset_0_0_10px_rgba(52,245,208,0.1)]"
                      : "hover:bg-jarvis-panel/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("size-4", isSelected ? "text-jarvis-primary" : "text-jarvis-text-muted group-hover:text-jarvis-text")} />
                    <span className={cn("text-sm font-bold", isSelected ? "text-jarvis-primary" : "text-jarvis-text")}>{agent.name}</span>
                  </div>
                  <p className="text-[10px] text-jarvis-text-muted leading-tight line-clamp-2 pl-6">{agent.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </motion.aside>
  );
}
