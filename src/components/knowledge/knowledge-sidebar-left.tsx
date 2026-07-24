"use client";

import { motion } from "framer-motion";
import { Database, FileText, Lightbulb, Bookmark, Star, Archive, Folder as FolderIcon, Tag as TagIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { KnowledgeState } from "@/lib/knowledge/use-knowledge";

interface SidebarProps {
  state: KnowledgeState;
}

export function KnowledgeSidebarLeft({ state }: SidebarProps) {
  const { selectedView, setSelectedView, folders, selectedFolderId, setSelectedFolderId, tags } = state;

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow text-lg">
          Knowledge
        </h2>
        <p className="text-[10px] text-jarvis-text-muted mt-1 uppercase tracking-widest font-mono">
          Second Brain Active
        </p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 mb-6 mt-2">
          <NavButton active={selectedView === "ALL"} onClick={() => { setSelectedView("ALL"); setSelectedFolderId(null); }} icon={Database} label="All Knowledge" />
          <NavButton active={selectedView === "NOTE"} onClick={() => { setSelectedView("NOTE"); setSelectedFolderId(null); }} icon={FileText} label="Notes" />
          <NavButton active={selectedView === "DOCUMENT"} onClick={() => { setSelectedView("DOCUMENT"); setSelectedFolderId(null); }} icon={FileText} label="Documents" />
          <NavButton active={selectedView === "IDEA"} onClick={() => { setSelectedView("IDEA"); setSelectedFolderId(null); }} icon={Lightbulb} label="Ideas" />
          <NavButton active={selectedView === "BOOKMARK"} onClick={() => { setSelectedView("BOOKMARK"); setSelectedFolderId(null); }} icon={Bookmark} label="Bookmarks" />
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2">Filters</h3>
          <NavButton active={selectedView === "FAVORITES"} onClick={() => { setSelectedView("FAVORITES"); setSelectedFolderId(null); }} icon={Star} label="Favorites" />
          <NavButton active={selectedView === "ARCHIVE"} onClick={() => { setSelectedView("ARCHIVE"); setSelectedFolderId(null); }} icon={Archive} label="Archive" />
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Folders</span>
          </h3>
          {folders.map(f => (
            <NavButton 
              key={f.id} 
              active={selectedFolderId === f.id} 
              onClick={() => { setSelectedFolderId(f.id); setSelectedView("ALL"); }} 
              icon={FolderIcon} 
              label={f.name} 
              isSmall 
            />
          ))}
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="px-2 text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest mb-2">Tags</h3>
          {tags.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg text-xs font-medium text-jarvis-text-muted hover:text-jarvis-text cursor-pointer">
              <TagIcon className="size-3" style={{ color: t.color || 'currentColor' }} />
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}

function NavButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label, 
  isSmall 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  label: string; 
  isSmall?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg transition-all duration-300 group font-medium",
        isSmall ? "p-2 text-xs" : "p-2.5 text-sm",
        active
          ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30 shadow-[inset_0_0_10px_rgba(52,245,208,0.1)]"
          : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
      )}
    >
      <Icon className={cn("shrink-0", isSmall ? "size-3" : "size-4")} />
      <span className="truncate">{label}</span>
    </button>
  );
}
