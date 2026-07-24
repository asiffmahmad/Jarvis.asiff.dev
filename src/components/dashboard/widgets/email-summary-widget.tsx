"use client";

import { Mail, Sparkles, Inbox, Send, Edit3 } from "lucide-react";
import { DashboardCard } from "../shared/dashboard-card";
import { type EmailSummaryData } from "@/services/dashboard";

interface EmailSummaryWidgetProps {
  data?: EmailSummaryData;
  isLoading: boolean;
}

export function EmailSummaryWidget({ data, isLoading }: EmailSummaryWidgetProps) {
  return (
    <DashboardCard
      title="Comm Link"
      icon={<Mail className="size-4" />}
      isLoading={isLoading}
      className="col-span-1"
    >
      {data && (
        <div className="flex flex-col justify-between h-full">
          <div className="flex items-end justify-between mb-4">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-jarvis-text text-glow">{data.unread}</p>
              <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">Unread Messages</p>
            </div>
            {data.aiSuggested > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-jarvis-accent/10 border border-jarvis-accent/30 text-jarvis-accent">
                <Sparkles className="size-3" />
                <span className="text-xs font-mono">{data.aiSuggested} Drafts Ready</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-[8px] bg-jarvis-panel/30 border border-jarvis-border/50 flex flex-col items-center justify-center gap-1">
              <Inbox className="size-3.5 text-jarvis-danger" />
              <span className="font-mono text-sm text-jarvis-text">{data.important}</span>
              <span className="text-[9px] text-jarvis-text-muted uppercase tracking-wider">Priority</span>
            </div>
            <div className="p-2 rounded-[8px] bg-jarvis-panel/30 border border-jarvis-border/50 flex flex-col items-center justify-center gap-1">
              <Edit3 className="size-3.5 text-jarvis-warning" />
              <span className="font-mono text-sm text-jarvis-text">{data.drafts}</span>
              <span className="text-[9px] text-jarvis-text-muted uppercase tracking-wider">Drafts</span>
            </div>
            <div className="p-2 rounded-[8px] bg-jarvis-panel/30 border border-jarvis-border/50 flex flex-col items-center justify-center gap-1">
              <Send className="size-3.5 text-jarvis-success" />
              <span className="font-mono text-sm text-jarvis-text">{data.scheduled}</span>
              <span className="text-[9px] text-jarvis-text-muted uppercase tracking-wider">Queued</span>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
