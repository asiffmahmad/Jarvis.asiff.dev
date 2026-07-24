"use client";

import { Search, Star, MoreHorizontal, FileIcon, Loader2 } from "lucide-react";
import type { MailState } from "@/lib/mail/use-mail";
import { cn } from "@/lib/utils";

interface MailListProps {
  mailState: MailState;
}

export function MailList({ mailState }: MailListProps) {
  const {
    threads,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedLabel,
    activeThreadId,
    setActiveThreadId,
    toggleStar
  } = mailState;

  return (
    <div className="flex-1 flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      {/* Search Header */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0 relative z-10 backdrop-blur-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-jarvis-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all emails..."
            className="w-full bg-jarvis-bg-deep/50 border border-jarvis-panel-border/50 text-jarvis-text text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-jarvis-primary/50 focus:ring-1 focus:ring-jarvis-primary/50 transition-all placeholder-jarvis-text-muted/50"
          />
        </div>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-jarvis-panel/20 bg-jarvis-panel/10">
        <h2 className="text-xs font-heading font-bold text-jarvis-text-muted uppercase tracking-widest">
          {selectedLabel}
        </h2>
        <button className="text-jarvis-text-muted hover:text-jarvis-text transition-colors">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-jarvis-primary">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-jarvis-text-muted opacity-50">
            <div className="size-16 border-2 border-dashed border-jarvis-panel-border rounded-full flex items-center justify-center mb-4">
              <InboxIcon className="size-8" />
            </div>
            <p className="font-heading tracking-widest uppercase">No Emails Found</p>
          </div>
        ) : (
          <div className="divide-y divide-jarvis-panel/30">
            {threads.map((thread) => {
              const isSelected = activeThreadId === thread.id;
              
              // Find the last participant that isn't 'me' (simplified)
              const sender = thread.participants.find(p => p.email !== "tony@starkindustries.com") || thread.participants[0];

              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={cn(
                    "group relative p-4 cursor-pointer transition-all duration-200 border-l-2",
                    isSelected 
                      ? "bg-jarvis-primary/10 border-jarvis-primary shadow-inner" 
                      : thread.isUnread
                        ? "bg-jarvis-panel/20 border-jarvis-accent hover:bg-jarvis-panel/40"
                        : "bg-transparent border-transparent hover:bg-jarvis-panel/20 hover:border-jarvis-panel-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold", isSelected ? "text-jarvis-primary" : "text-jarvis-text", thread.isUnread && "text-jarvis-text")}>
                        {sender.name}
                      </span>
                      {thread.messages.length > 1 && (
                        <span className="text-[10px] bg-jarvis-panel/50 text-jarvis-text-muted px-1.5 py-0.5 rounded-full">
                          {thread.messages.length}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-jarvis-text-muted font-mono">
                      {new Date(thread.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 overflow-hidden">
                      <h4 className={cn("text-xs mb-1 truncate", thread.isUnread ? "font-bold text-white" : "font-medium text-jarvis-text")}>
                        {thread.subject}
                      </h4>
                      <p className="text-xs text-jarvis-text-muted truncate">
                        {thread.snippet}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between shrink-0 pl-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStar(thread.id); }}
                        className={cn(
                          "transition-colors",
                          thread.isStarred ? "text-jarvis-accent" : "text-jarvis-text-muted opacity-0 group-hover:opacity-100 hover:text-jarvis-text"
                        )}
                      >
                        <Star className="size-4" fill={thread.isStarred ? "currentColor" : "none"} />
                      </button>
                      
                      {thread.messages.some(m => m.attachments?.length) && (
                        <FileIcon className="size-3 text-jarvis-text-muted mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
