import { useState, useCallback, useEffect, useMemo } from "react";
import { GmailService } from "./gmail-service";
import type { EmailThread, MailLabel } from "./types";

export type MailState = ReturnType<typeof useMail>;

export function useMail() {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<MailLabel>("INBOX");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const service = GmailService.getInstance();

  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    const data = await service.getThreads(selectedLabel);
    setThreads(data);
    setIsLoading(false);
  }, [selectedLabel, service]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadThreads();
  }, [loadThreads]);

  const activeThread = useMemo(() => {
    return threads.find(t => t.id === activeThreadId) || null;
  }, [threads, activeThreadId]);

  const filteredThreads = useMemo(() => {
    if (!searchQuery) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter(t => 
      t.subject.toLowerCase().includes(q) ||
      t.snippet.toLowerCase().includes(q) ||
      t.participants.some(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
    );
  }, [threads, searchQuery]);

  const toggleStar = useCallback(async (threadId: string) => {
    // Optimistic update
    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isStarred: !t.isStarred } : t
    ));
    await service.toggleStar(threadId);
  }, [service]);

  const markAsRead = useCallback(async (threadId: string) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isUnread: false } : t
    ));
    await service.toggleRead(threadId, false);
  }, [service]);

  // When a thread is opened, mark as read
  useEffect(() => {
    if (activeThreadId && activeThread?.isUnread) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      markAsRead(activeThreadId);
    }
  }, [activeThreadId, activeThread?.isUnread, markAsRead]);

  return {
    threads: filteredThreads,
    isLoading,
    activeThreadId,
    setActiveThreadId,
    activeThread,
    selectedLabel,
    setSelectedLabel,
    searchQuery,
    setSearchQuery,
    toggleStar,
    markAsRead,
    refresh: loadThreads
  };
}
