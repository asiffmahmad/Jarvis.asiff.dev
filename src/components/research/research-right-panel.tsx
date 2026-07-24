"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Bookmark, Terminal, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ResearchState } from "@/lib/research/use-research";
import { storeResearchContext } from "@/lib/cross-page-store";
import ReactMarkdown from "react-markdown";

interface RightPanelProps {
  state: ResearchState;
}

export function ResearchRightPanel({ state }: RightPanelProps) {
  const { activeArticle, isBookmarked, toggleBookmark } = state;
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const router = useRouter();
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset summary when article changes
  const lastArticleIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeArticle && activeArticle.id !== lastArticleIdRef.current) {
      setSummary(null);
      lastArticleIdRef.current = activeArticle.id;
    }
  }, [activeArticle]);

  const handleSummarize = async () => {
    if (isSummarizing || !activeArticle) return;
    
    setIsSummarizing(true);
    setSummary("");
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/research/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          articleTitle: activeArticle.title,
          articleContent: activeArticle.content
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
              setSummary(prev => (prev || "") + content);
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setSummary(`[ERROR: ${(err as Error).message}]`);
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!activeArticle) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-jarvis-bg-deepest text-jarvis-text-muted">
          <Terminal className="size-12 opacity-30 mb-4" />
          <span className="font-heading uppercase tracking-widest text-xs">Select Article to Read</span>
          <p className="text-[10px] font-mono text-jarvis-text-muted/50 mt-2 text-center">Click an article or ask AI to research a topic above</p>
      </div>
    );
  }

  return (
    <div className="flex-[1.5] flex flex-col relative bg-jarvis-bg-deepest h-full">
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
        <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
          Reader
        </h2>
        <button
          onClick={() => { storeResearchContext({ topic: activeArticle.title, context: activeArticle.content }); router.push("/agents"); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold uppercase tracking-wider bg-jarvis-primary/10 border border-jarvis-primary/30 text-jarvis-primary hover:bg-jarvis-primary hover:text-jarvis-bg-deepest mr-2"
        >
          <Send className="size-3" /> Generate Post
        </button>
        <button 
          onClick={() => toggleBookmark(activeArticle.id)}
          className={`p-2 rounded-full transition-colors border ${isBookmarked(activeArticle.id) ? 'bg-jarvis-primary/20 border-jarvis-primary/50 text-jarvis-primary' : 'bg-jarvis-panel/30 border-jarvis-panel-border/50 text-jarvis-text-muted hover:text-jarvis-text'}`}
        >
          <Bookmark className="size-4" fill={isBookmarked(activeArticle.id) ? "currentColor" : "none"} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        
        {/* AI Insight Header */}
        <div className="m-6 bg-jarvis-panel/20 border border-jarvis-primary/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(52,245,208,0.05)]">
          <div className="bg-jarvis-primary/10 px-4 py-3 flex items-center justify-between border-b border-jarvis-primary/20">
            <span className="text-xs font-heading font-bold uppercase tracking-widest text-jarvis-primary flex items-center gap-2 text-glow">
              <Sparkles className="size-3" /> AI Analysis
            </span>
            <button 
              onClick={handleSummarize}
              disabled={isSummarizing || summary !== null}
              className="text-[10px] px-3 py-1 bg-jarvis-primary/20 hover:bg-jarvis-primary hover:text-jarvis-bg-deepest text-jarvis-primary rounded transition-colors border border-jarvis-primary/50 disabled:opacity-50"
            >
              {isSummarizing ? "Analyzing..." : summary ? "Complete" : "Summarize Article"}
            </button>
          </div>
          
          {summary !== null && (
            <div className="p-4 prose prose-invert prose-jarvis text-sm max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
              {isSummarizing && <span className="inline-block w-1 h-3 ml-1 bg-jarvis-primary animate-pulse" />}
            </div>
          )}
        </div>

        {/* Article Body */}
        <div className="px-8 pb-12">
          <h1 className="text-3xl font-bold text-jarvis-text mb-4 leading-tight">{activeArticle.title}</h1>
          <div className="flex items-center gap-4 text-xs text-jarvis-text-muted mb-8 pb-4 border-b border-jarvis-panel-border/30">
            <span>By {activeArticle.author}</span>
            <span>{new Date(activeArticle.publishedAt).toLocaleDateString()}</span>
          </div>
          
          <div className="prose prose-invert prose-jarvis max-w-none">
            {/* Real implementation would parse HTML here. For mock, we just render the raw string */}
            <p className="text-jarvis-text/80 text-lg leading-relaxed">{activeArticle.content}</p>
          </div>
        </div>

      </ScrollArea>
    </div>
  );
}
