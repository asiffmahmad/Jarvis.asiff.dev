"use client";

import { motion } from "framer-motion";
import { Inbox, Send, File, Trash2, AlertCircle, Star, AlertOctagon, PenSquare, Tag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { MailState } from "@/lib/mail/use-mail";
import type { MailLabel } from "@/lib/mail/types";

interface MailSidebarLeftProps {
  mailState: MailState;
  onCompose: () => void;
}

const SYSTEM_LABELS: { id: MailLabel; label: string; icon: React.ElementType }[] = [
  { id: "INBOX", label: "Inbox", icon: Inbox },
  { id: "STARRED", label: "Starred", icon: Star },
  { id: "IMPORTANT", label: "Important", icon: AlertOctagon },
  { id: "SENT", label: "Sent", icon: Send },
  { id: "DRAFT", label: "Drafts", icon: File },
  { id: "SPAM", label: "Spam", icon: AlertCircle },
  { id: "TRASH", label: "Trash", icon: Trash2 },
];

export function MailSidebarLeft({ mailState, onCompose }: MailSidebarLeftProps) {
  const { selectedLabel, setSelectedLabel, threads } = mailState;

  const handleSelect = (id: MailLabel) => {
    setSelectedLabel(id);
  };

  // Mock custom labels
  const customLabels = [
    { id: "LABEL_1", name: "Project Ultron", color: "#e11d48" },
    { id: "LABEL_2", name: "Avengers", color: "#2563eb" },
    { id: "LABEL_3", name: "Stark Industries", color: "#16a34a" },
  ];

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <button 
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 bg-jarvis-primary/10 hover:bg-jarvis-primary hover:text-jarvis-bg-deepest text-jarvis-primary border border-jarvis-primary/50 py-3 rounded-xl font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(52,245,208,0.1)] hover:shadow-[0_0_30px_rgba(52,245,208,0.3)]"
        >
          <PenSquare className="size-4" /> Compose
        </button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 mb-6">
          {SYSTEM_LABELS.map((cat) => {
            const isSelected = selectedLabel === cat.id;
            // Extremely naive unread count mock based on in-memory threads
            const count = threads.filter(t => t.labels.includes(cat.id) && t.isUnread).length;
            
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 group",
                  isSelected
                    ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
                    : "text-jarvis-text hover:bg-jarvis-panel/50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <cat.icon className={cn("size-4", isSelected ? "text-jarvis-primary" : "text-jarvis-text-muted")} />
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                {count > 0 && (
                  <span className="text-[10px] bg-jarvis-primary text-jarvis-bg-deepest px-1.5 py-0.5 rounded font-bold">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-2 mb-2">
          <h3 className="text-xs font-bold text-jarvis-text-muted uppercase tracking-wider">
            Labels
          </h3>
        </div>
        
        <div className="space-y-1">
          {customLabels.map((lbl) => {
            const isSelected = selectedLabel === lbl.id;
            return (
              <button
                key={lbl.id}
                onClick={() => handleSelect(lbl.id)}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 group",
                  isSelected
                    ? "bg-jarvis-panel/50 text-jarvis-text border border-jarvis-panel-border"
                    : "text-jarvis-text hover:bg-jarvis-panel/30 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Tag className="size-3" style={{ color: lbl.color }} />
                  <span className="text-sm font-medium">{lbl.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
