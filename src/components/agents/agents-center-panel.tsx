"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, CheckCircle2, AlertCircle, Loader2, Sparkles, Terminal,
  Send, Hash, Target, X, Copy, Check,
} from "lucide-react";
import type { AgentsState } from "@/lib/agents/use-agents";
import { cn, safeJsonParse } from "@/lib/utils";
import { PostGenerator } from "./post-generator";
import { AgentPipelineWithResearch } from "./agent-pipeline";
import { getResearchContext } from "@/lib/cross-page-store";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CenterPanelProps {
  state: AgentsState;
}

interface ParsedPost {
  title: string;
  caption: string;
  hashtags: string[];
  mediaIdeas: string[];
  callToAction: string;
  platform: string;
  bestPostingTime: string;
}

function tryParsePost(result: string): ParsedPost | null {
  try {
    // Try direct JSON parse
    const parsed = safeJsonParse(result) as Record<string, unknown>;
    if (parsed.caption && parsed.hashtags) {
      return {
        title: (parsed.title as string) || "Untitled",
        caption: parsed.caption as string,
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags as string[] : [],
        mediaIdeas: Array.isArray(parsed.mediaIdeas) ? parsed.mediaIdeas as string[] : [],
        callToAction: (parsed.callToAction as string) || "",
        platform: (parsed.platform as string) || "linkedin",
        bestPostingTime: (parsed.bestPostingTime as string) || "",
      };
    }
  } catch {
    // Not JSON, try to extract sections from markdown
    const captionMatch = result.match(/\*{0,2}Caption\*{0,2}[:\s]*([\s\S]*?)(?=\n\*{0,2}Hashtags|\n\*{0,2}Media|\n\*{0,2}Call|\n\*{0,2}CTA|$)/i);
    const hashtagMatch = result.match(/(?:hashtags?|tags)[:\s]*([\s\S]*?)(?=\n\*{0,2}Media|\n\*{0,2}Call|\n\*{0,2}CTA|$)/i);
    const mediaMatch = result.match(/(?:media ideas?|media)[:\s]*([\s\S]*?)(?=\n\*{0,2}Call|\n\*{0,2}CTA|$)/i);
    const ctaMatch = result.match(/(?:call(?:[- ]to[- ]action)?|cta)[:\s]*([\s\S]*?)$/i);

    if (captionMatch || hashtagMatch) {
      return {
        title: result.split("\n")[0].replace(/^#+\s*/, "").slice(0, 100),
        caption: captionMatch ? captionMatch[1].trim() : result.slice(0, 500),
        hashtags: hashtagMatch
          ? hashtagMatch[1].match(/#?\w+/g)?.map(h => h.replace(/^#/, "")) || []
          : [],
        mediaIdeas: mediaMatch
          ? mediaMatch[1].split("\n").filter(l => l.trim()).map(l => l.replace(/^[-*\d.]+\s*/, ""))
          : [],
        callToAction: ctaMatch ? ctaMatch[1].trim() : "",
        platform: "linkedin",
        bestPostingTime: "",
      };
    }
  }
  return null;
}

export function AgentsCenterPanel({ state }: CenterPanelProps) {
  const router = useRouter();
  const { activeAgent, executionState } = state;
  const [mode, setMode] = useState<"agent" | "post" | "pipeline">(() => {
    return getResearchContext() ? "pipeline" : "agent";
  });
  const outputRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (executionState.result && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [executionState.result]);

  const isRunning = executionState.status === "running";
  const hasResult = executionState.status === "success" && executionState.result;

  const parsedPost = useMemo(
    () => (hasResult ? tryParsePost(executionState.result!) : null),
    [hasResult, executionState.result]
  );

  // Auto-navigate to /create when a post is detected from agent output
  useEffect(() => {
    if (parsedPost && !isRunning && hasResult && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const timer = setTimeout(async () => {
        try {
          await fetch("/api/publish/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              post: {
                title: parsedPost.title,
                caption: parsedPost.caption,
                hashtags: parsedPost.hashtags,
                mediaIdeas: parsedPost.mediaIdeas,
                callToAction: parsedPost.callToAction,
                platform: parsedPost.platform,
                bestPostingTime: parsedPost.bestPostingTime,
                topic: parsedPost.title,
                tone: "professional",
                contentType: "post",
              }
            }),
          });
        } catch (err) {
          console.error("Failed to save draft to MySQL:", err);
        }
        router.push("/create");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [parsedPost, isRunning, hasResult, router]);

  const copyCaption = async () => {
    if (!parsedPost) return;
    await navigator.clipboard.writeText(parsedPost.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      {/* Mode Toggle */}
      <div className="h-14 border-b border-jarvis-panel/30 flex items-center px-6 gap-4 shrink-0">
        <button
          onClick={() => setMode("agent")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider",
            mode === "agent"
              ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
              : "text-jarvis-text-muted hover:text-jarvis-text"
          )}
        >
          <Cpu className="size-4" />
          Agent Execute
        </button>
        <button
          onClick={() => setMode("post")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider",
            mode === "post"
              ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
              : "text-jarvis-text-muted hover:text-jarvis-text"
          )}
        >
          <Sparkles className="size-4" />
          Generate Post
        </button>
        <button
          onClick={() => setMode("pipeline")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider",
            mode === "pipeline"
              ? "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/30"
              : "text-jarvis-text-muted hover:text-jarvis-text"
          )}
        >
          <Send className="size-4" />
          Pipeline
        </button>
      </div>

      {mode === "post" ? (
        <PostGenerator />
      ) : mode === "pipeline" ? (
        <AgentPipelineWithResearch />
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {!activeAgent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
              <Cpu className="size-16 mb-4" />
              <h2 className="text-lg font-heading tracking-widest uppercase">No Agent Selected</h2>
              <p className="text-xs font-mono text-jarvis-text-muted/50 mt-2">Select an agent from the sidebar</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Agent Status Section */}
              <div className="flex flex-col items-center justify-center pt-8 pb-4 px-8 shrink-0">
                <motion.div
                  key={activeAgent.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className={cn(
                    "w-20 h-20 rounded-full border-2 glass-strong flex items-center justify-center relative transition-all duration-500",
                    executionState.status === 'running' && "border-[#F5A623] shadow-[0_0_40px_rgba(245,166,35,0.2)] animate-pulse",
                    executionState.status === 'success' && "border-[#34F5D0] shadow-[0_0_40px_rgba(52,245,208,0.2)]",
                    executionState.status === 'error' && "border-[#FF4D4D] shadow-[0_0_40px_rgba(255,77,77,0.2)]"
                  )}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-jarvis-primary/5 to-transparent mix-blend-screen" />
                    {executionState.status === 'running' ? (
                      <Loader2 className="size-10 text-[#F5A623] animate-spin" />
                    ) : executionState.status === 'success' ? (
                      <CheckCircle2 className="size-10 text-[#34F5D0]" />
                    ) : executionState.status === 'error' ? (
                      <AlertCircle className="size-10 text-[#FF4D4D]" />
                    ) : (
                      <Cpu className="size-10 text-jarvis-text-muted opacity-50" />
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-heading font-bold uppercase tracking-widest text-glow text-jarvis-text">
                    {activeAgent.name}
                  </h2>
                  {executionState.status !== "idle" && (
                    <div className="w-80 mt-4 bg-jarvis-panel/30 h-1.5 rounded-full overflow-hidden border border-jarvis-panel-border/50">
                      <motion.div
                        className={cn(
                          "h-full",
                          executionState.status === 'running' ? "bg-[#F5A623]" :
                          executionState.status === 'success' ? "bg-[#34F5D0]" :
                          executionState.status === 'error' ? "bg-[#FF4D4D]" : "bg-transparent"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${executionState.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  )}
                  {executionState.logs.length > 0 && (
                    <p className="mt-2 text-[11px] font-mono text-jarvis-text-muted uppercase tracking-widest">
                      {executionState.logs[executionState.logs.length - 1].message}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Live Output + Post Preview */}
              <div className="flex-1 overflow-y-auto px-8 pb-6 space-y-4">
                {/* Agent text output */}
                <AnimatePresence>
                  {(isRunning || hasResult) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-jarvis-bg/80 border border-jarvis-panel-border/50 rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-jarvis-panel-border/30 bg-jarvis-panel/20 shrink-0">
                        <Terminal className="size-3 text-jarvis-primary" />
                        <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">
                          {isRunning ? "Live Output" : "Agent Response"}
                        </span>
                        {isRunning && (
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-[#F5A623] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
                            Streaming
                          </span>
                        )}
                      </div>
                      <div className="p-4 max-h-64 overflow-y-auto" ref={outputRef}>
                        <div className="font-mono text-sm text-jarvis-text/90 whitespace-pre-wrap leading-relaxed">
                          {executionState.result || (
                            <span className="text-jarvis-text-muted/50 italic">Waiting for response...</span>
                          )}
                          {isRunning && (
                            <span className="inline-block w-2 h-4 bg-[#F5A623] ml-0.5 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Post Preview Card */}
                <AnimatePresence>
                  {parsedPost && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-jarvis-panel border border-jarvis-panel-border rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-2 border-b border-jarvis-panel-border/30 bg-jarvis-primary/5">
                        <span className="text-[10px] font-bold text-jarvis-primary uppercase tracking-widest flex items-center gap-2">
                          <Sparkles className="size-3" /> Generated Post Preview
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={copyCaption} className="flex items-center gap-1 text-[10px] text-jarvis-text-muted hover:text-jarvis-primary transition-colors">
                            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                          <span className="text-[10px] font-mono text-jarvis-text-muted">
                            {parsedPost.caption.length} chars
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Title</span>
                          <p className="text-base font-bold text-jarvis-text mt-0.5">{parsedPost.title}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Caption</span>
                          <p className="text-sm text-jarvis-text/80 mt-0.5 whitespace-pre-wrap leading-relaxed">{parsedPost.caption}</p>
                        </div>
                        {parsedPost.hashtags.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1">
                              <Hash className="size-3" /> Hashtags
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {parsedPost.hashtags.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 rounded bg-jarvis-primary/5 border border-jarvis-primary/20 text-[11px] text-jarvis-primary font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {parsedPost.mediaIdeas.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1">
                              <Target className="size-3" /> Media Ideas
                            </span>
                            <ul className="mt-1 space-y-0.5">
                              {parsedPost.mediaIdeas.map((idea, i) => (
                                <li key={i} className="text-sm text-jarvis-text/70 flex items-start gap-2">
                                  <span className="text-jarvis-primary mt-1">▸</span>
                                  {idea}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {parsedPost.callToAction && (
                          <div className="pt-2 border-t border-jarvis-panel-border/50">
                            <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">CTA</span>
                            <p className="text-sm text-jarvis-text/80 mt-0.5">{parsedPost.callToAction}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="px-4 py-3 border-t border-jarvis-panel-border/30 bg-jarvis-panel/30 flex items-center justify-center">
                        <span className="text-[10px] font-mono text-jarvis-primary flex items-center gap-2">
                          <Loader2 className="size-3 animate-spin" />
                          Redirecting to Create Page...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
