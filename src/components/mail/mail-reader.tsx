"use client";

import { useState, useRef } from "react";
import { CornerUpLeft, MoreVertical, Sparkles, Download, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MailState } from "@/lib/mail/use-mail";
import ReactMarkdown from "react-markdown";

interface MailReaderProps {
  mailState: MailState;
  onReply: () => void;
}

export function MailReader({ mailState, onReply }: MailReaderProps) {
  const { activeThread } = mailState;
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  
  // Track expanded messages. By default, only expand the last message.
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);

  if (!activeThread) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-jarvis-bg-deepest text-jarvis-text-muted">
        <div className="size-20 border border-dashed border-jarvis-panel-border rounded-xl flex items-center justify-center mb-4">
          <Sparkles className="size-8 opacity-50" />
        </div>
        <p className="font-heading tracking-widest uppercase">No Thread Selected</p>
      </div>
    );
  }

  const handleSummarize = async () => {
    if (isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    setSummaryResult("");
    abortControllerRef.current = new AbortController();

    try {
      const threadContext = activeThread.messages.map(m => `From: ${m.from.name}\nDate: ${m.date}\n\n${m.bodyPlain}`).join("\n\n---\n\n");

      const res = await fetch("/api/mail/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          threadContext,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Execution failed");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let chunk;
        while (!(chunk = await reader.read()).done) {
          const text = decoder.decode(chunk.value, { stream: true });
          const lines = text.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              const content = JSON.parse(line.slice(2));
              setSummaryResult(prev => (prev || "") + content);
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setSummaryResult(`[ERROR: ${(err as Error).message}]`);
      }
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const toggleMessage = (id: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isMessageExpanded = (index: number, msgId: string) => {
    if (expandedMessages[msgId] !== undefined) return expandedMessages[msgId];
    // Default to last message expanded
    return index === activeThread.messages.length - 1;
  };

  return (
    <div className="flex-[2] h-full flex flex-col relative bg-jarvis-bg-deepest">
      {/* Header */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
        <h2 className="text-lg font-heading font-bold text-jarvis-text truncate max-w-[70%]">
          {activeThread.subject}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={onReply}
            className="flex items-center gap-2 px-4 py-2 bg-jarvis-primary/10 hover:bg-jarvis-primary hover:text-jarvis-bg-deepest text-jarvis-primary rounded-lg transition-all text-xs font-bold uppercase tracking-wider border border-jarvis-primary/50 shadow-[0_0_15px_rgba(52,245,208,0.1)]"
          >
            <CornerUpLeft className="size-3" /> Reply
          </button>
          <button className="p-2 text-jarvis-text-muted hover:text-jarvis-text transition-colors rounded-lg hover:bg-jarvis-panel/30">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          
          {/* AI Summary Panel */}
          <div className="bg-jarvis-panel/20 border border-jarvis-primary/30 rounded-xl overflow-hidden relative shadow-[0_0_20px_rgba(52,245,208,0.05)]">
            <div className="bg-jarvis-primary/10 px-4 py-2 flex items-center justify-between border-b border-jarvis-primary/20">
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-jarvis-primary flex items-center gap-2 text-glow">
                <Sparkles className="size-3" /> AI Thread Summary
              </span>
              <button 
                onClick={handleSummarize}
                disabled={isGeneratingSummary}
                className="text-[10px] px-2 py-1 bg-jarvis-bg-deep/50 hover:bg-jarvis-panel/50 text-jarvis-text rounded transition-colors border border-jarvis-panel-border/50 disabled:opacity-50"
              >
                {isGeneratingSummary ? "Analyzing..." : "Generate"}
              </button>
            </div>
            {summaryResult ? (
              <div className="p-4 prose prose-invert prose-jarvis text-sm max-w-none">
                <ReactMarkdown>{summaryResult}</ReactMarkdown>
                {isGeneratingSummary && <span className="inline-block w-1 h-3 ml-1 bg-jarvis-primary animate-pulse" />}
              </div>
            ) : (
              <div className="p-4 text-xs text-jarvis-text-muted/50 italic">
                No summary generated yet.
              </div>
            )}
          </div>

          {/* Thread Messages */}
          <div className="space-y-4 pb-20">
            {activeThread.messages.map((msg, idx) => {
              const expanded = isMessageExpanded(idx, msg.id);

              return (
                <div key={msg.id} className="border border-jarvis-panel-border/30 rounded-xl bg-jarvis-bg-deep/30 overflow-hidden transition-all duration-300">
                  {/* Message Header */}
                  <div 
                    onClick={() => toggleMessage(msg.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-jarvis-panel/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-jarvis-panel/50 border border-jarvis-panel-border flex items-center justify-center overflow-hidden shrink-0">
                        {msg.from.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={msg.from.avatarUrl} alt={msg.from.name} className="size-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-jarvis-text">{msg.from.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-jarvis-text">{msg.from.name}</span>
                          <span className="text-xs text-jarvis-text-muted">&lt;{msg.from.email}&gt;</span>
                        </div>
                        <div className="text-[10px] text-jarvis-text-muted">
                          to {msg.to.map(t => t.name).join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-jarvis-text-muted">
                      <span className="text-xs font-mono">
                        {new Date(msg.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                  </div>

                  {/* Message Body */}
                  {expanded && (
                    <div className="px-4 pb-4 border-t border-jarvis-panel/10 pt-4">
                      <div 
                        className="prose prose-invert prose-jarvis max-w-none text-sm text-jarvis-text/90"
                        dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                      />
                      
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-jarvis-panel/20 flex flex-wrap gap-3">
                          {msg.attachments.map(att => (
                            <div key={att.id} className="flex items-center gap-3 bg-jarvis-panel/30 border border-jarvis-panel-border/50 rounded-lg p-2 group hover:bg-jarvis-panel/50 transition-colors cursor-pointer">
                              <div className="p-2 bg-jarvis-primary/10 text-jarvis-primary rounded">
                                <FileIcon className="size-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-jarvis-text truncate max-w-[150px]">{att.filename}</span>
                                <span className="text-[10px] text-jarvis-text-muted font-mono">{Math.round(att.size / 1024)} KB</span>
                              </div>
                              <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:text-jarvis-primary"><Download className="size-3" /></button>
                                <button className="p-1 hover:text-jarvis-primary"><ExternalLink className="size-3" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
