"use client";

import { Folder, Search, Plus, Star, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WorkspaceSidebar() {
  return (
    <div className="w-[260px] h-full flex flex-col border-r border-jarvis-border bg-jarvis-bg-deepest/95 backdrop-blur-xl shrink-0">
      <div className="p-4 space-y-4">
        <Button variant="primary" className="w-full justify-start gap-2 h-10 shadow-[0_0_15px_rgba(52,245,208,0.15)]">
          <Plus className="size-4" />
          <span className="font-heading tracking-widest text-xs uppercase">New Session</span>
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-jarvis-text-muted" />
          <Input 
            placeholder="Search Memory..." 
            className="h-8 pl-9 bg-jarvis-panel/30 border-jarvis-border/50 text-xs focus:border-jarvis-primary/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-6 pb-6">
          {/* Favorites */}
          <div className="px-2">
            <h3 className="text-[10px] font-mono text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Star className="size-3 text-jarvis-warning" /> Pinned
            </h3>
            <div className="space-y-1">
              <SidebarItem icon={<MessageSquare className="size-3.5" />} label="Q3 Content Strategy" active />
              <SidebarItem icon={<MessageSquare className="size-3.5" />} label="API Integration Docs" />
            </div>
          </div>

          {/* Folders */}
          <div className="px-2">
            <h3 className="text-[10px] font-mono text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Folder className="size-3 text-jarvis-primary" /> Data Cores
            </h3>
            <div className="space-y-1">
              <SidebarItem icon={<Folder className="size-3.5 text-jarvis-text-muted" />} label="Marketing Assets" />
              <SidebarItem icon={<Folder className="size-3.5 text-jarvis-text-muted" />} label="Research Papers" />
              <SidebarItem icon={<Folder className="size-3.5 text-jarvis-text-muted" />} label="System Logs" />
            </div>
          </div>

          {/* Recent */}
          <div className="px-2">
            <h3 className="text-[10px] font-mono text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Clock className="size-3 text-jarvis-secondary" /> Chronology
            </h3>
            <div className="space-y-1">
              <SidebarItem icon={<MessageSquare className="size-3.5" />} label="Debug Authentication" />
              <SidebarItem icon={<MessageSquare className="size-3.5" />} label="Generate Weekly Report" />
              <SidebarItem icon={<MessageSquare className="size-3.5" />} label="Draft UI Components" />
              <SidebarItem icon={<MessageSquare className="size-3.5" />} label="SEO Optimization Ideas" />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function SidebarItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] text-left transition-all group focus:outline-none",
        active 
          ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/20" 
          : "text-jarvis-text hover:bg-jarvis-panel hover:text-jarvis-text"
      )}
    >
      <div className={cn(
        "shrink-0",
        active ? "text-jarvis-primary" : "text-jarvis-text-muted group-hover:text-jarvis-text"
      )}>
        {icon}
      </div>
      <span className="text-xs truncate">{label}</span>
    </button>
  );
}
