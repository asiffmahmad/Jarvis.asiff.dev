"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Loader2, CheckCircle2, AlertCircle, X,
  Terminal, Hash, Target, Copy, Check,
} from "lucide-react";
import { cn, safeJsonParse } from "@/lib/utils";
import { getResearchContext, clearResearchContext, storeGeneratedPost } from "@/lib/cross-page-store";

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "success" | "error";
  result: string;
  systemPrompt: string;
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

function tryParsePost(text: string): ParsedPost | null {
  try {
    const p = safeJsonParse(text) as Record<string, unknown>;
    if (p.caption) {
      return {
        title: (p.title as string) || "",
        caption: p.caption as string,
        hashtags: Array.isArray(p.hashtags) ? p.hashtags as string[] : [],
        mediaIdeas: Array.isArray(p.mediaIdeas) ? p.mediaIdeas as string[] : [],
        callToAction: (p.callToAction as string) || "",
        platform: (p.platform as string) || "linkedin",
        bestPostingTime: (p.bestPostingTime as string) || "",
      };
    }
  } catch {}
  return null;
}

async function streamAgent(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/agents/execute", {
    signal,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "pipeline-agent",
      linkedPromptContent: systemPrompt,
      runtimeVariables: { user_prompt: userMessage },
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let full = "";

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (line.startsWith("0:")) {
          try {
            const text = safeJsonParse(line.slice(2));
            full += text;
            onChunk(full);
          } catch {}
        }
      }
    }
  }
  return full;
}

export function AgentPipeline({ initialTopic, initialContext }: { initialTopic?: string; initialContext?: string }) {
  const [topic, setTopic] = useState(initialTopic || "");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [post, setPost] = useState<ParsedPost | null>(null);
  const hasStartedRef = useRef(false);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const hasNavigatedRef = useRef(false);

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: "research",
      name: "Research Agent",
      description: "Researches the topic and gathers key insights",
      status: "pending",
      result: "",
      systemPrompt: `You are a research analyst. Research the given topic thoroughly and provide:
1. A concise executive summary
2. Key findings and insights
3. Relevant data points and statistics
4. Potential implications
Format your response with clear markdown sections.`,
    },
    {
      id: "content",
      name: "Content Publisher",
      description: "Creates a platform-optimized post from the research",
      status: "pending",
      result: "",
      systemPrompt: `You are a social media content strategist and copywriter.
You will receive research about a topic. Use it to generate a complete post ready for publishing.
Return ONLY valid JSON with this structure:
{
  "title": "Catchy post title",
  "caption": "Full post caption with line breaks",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "mediaIdeas": ["Idea 1 for image/video", "Idea 2"],
  "callToAction": "Clear CTA for engagement",
  "platform": "linkedin",
  "bestPostingTime": "Best time to post"
}
Rules: Caption must be substantive. Include 3-5 relevant hashtags.
Return raw JSON only - no markdown, no code fences.`,
    },
  ]);

  const reset = useCallback(() => {
    setSteps(s => s.map(st => ({ ...st, status: "pending" as const, result: "" })));
    setCurrentStepIndex(-1);
    setPost(null);
    setIsRunning(false);
    abortRef.current = null;
  }, []);

  useEffect(() => {
    if (initialTopic && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const timer = setTimeout(() => handleStart(), 500);
      return () => clearTimeout(timer);
    }
  }, [initialTopic]);

  const handleStart = async () => {
    if (!topic.trim() || isRunning) return;
    reset();
    setIsRunning(true);
    abortRef.current = new AbortController();
    setPost(null);

    const updated = [...steps];
    updated[0] = { ...updated[0], status: "running", result: "" };
    updated[1] = { ...updated[1], status: "pending", result: "" };
    setSteps(updated);
    setCurrentStepIndex(0);

    try {
      // Step 1: Research (skip if context was provided)
      let researchResult: string;
      if (initialContext) {
        researchResult = initialContext;
        setSteps(s => {
          const c = [...s];
          c[0] = { ...c[0], status: "success", result: "Using provided research context." };
          c[1] = { ...c[1], status: "running", result: "" };
          return c;
        });
        setCurrentStepIndex(1);
      } else {
        const researchPrompt = `Research the following topic in depth:\n\nTopic: ${topic.trim()}\n\nProvide executive summary, key findings, data points, and implications.`;
        researchResult = await streamAgent(
          steps[0].systemPrompt,
          researchPrompt,
          (text) => {
            setSteps(s => {
              const c = [...s];
              c[0] = { ...c[0], result: text };
              return c;
            });
          },
          abortRef.current.signal,
        );

        setSteps(s => {
          const c = [...s];
          c[0] = { ...c[0], status: "success", result: researchResult };
          c[1] = { ...c[1], status: "running", result: "" };
          return c;
        });
        setCurrentStepIndex(1);
      }

      // Step 2: Content Publisher with research context
      const contentPrompt = `Topic: ${topic.trim()}\n\nHere is the research on this topic:\n\n${researchResult}\n\nBased on this research, create a complete social media post.`;
      const contentResult = await streamAgent(
        steps[1].systemPrompt,
        contentPrompt,
        (text) => {
          setSteps(s => {
            const c = [...s];
            c[1] = { ...c[1], result: text };
            return c;
          });
        },
        abortRef.current.signal,
      );

      setSteps(s => {
        const c = [...s];
        c[1] = { ...c[1], status: "success", result: contentResult };
        return c;
      });

      const parsed = tryParsePost(contentResult);
      setPost(parsed);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setSteps(s => s.map(st => st.status === "running" ? { ...st, status: "error" as const } : st));
      } else {
        setSteps(s => s.map(st => st.status === "running" ? { ...st, status: "error" as const, result: (err as Error).message } : st));
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-navigate to /create when a post is generated
  useEffect(() => {
    if (post && !isRunning && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const timer = setTimeout(() => {
        storeGeneratedPost({
          title: post.title,
          caption: post.caption,
          hashtags: post.hashtags,
          mediaIdeas: post.mediaIdeas,
          callToAction: post.callToAction,
          platform: post.platform,
          bestPostingTime: post.bestPostingTime,
          topic: topic.trim(),
          tone: "professional",
          contentType: "post",
        });
        router.push("/create");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [post, isRunning, router]);

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  const copyCaption = async () => {
    if (!post) return;
    await navigator.clipboard.writeText(post.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6">
      {/* Topic Input */}
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-jarvis-primary" />
          <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">Content Pipeline</h2>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic — AI agents will research and create a post..."
              className="w-full bg-jarvis-panel border border-jarvis-panel-border rounded-xl px-4 py-3 text-sm text-jarvis-text placeholder-jarvis-text-muted/50 outline-none resize-none h-20 focus:border-jarvis-primary/50 transition-colors"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
            />
          </div>
          <div className="flex flex-col gap-2 self-end">
            {isRunning ? (
              <button onClick={handleStop} className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider bg-[#FF4D4D] hover:bg-[#FF4D4D]/80 text-white">
                <X className="size-4" /> Stop
              </button>
            ) : (
              <button onClick={handleStart} disabled={!topic.trim()} className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider",
                !topic.trim() ? "opacity-30 cursor-not-allowed bg-jarvis-panel text-jarvis-text" : "bg-[#34F5D0] hover:bg-[#34F5D0]/80 text-jarvis-bg-deepest"
              )}>
                <Send className="size-4" /> Start Pipeline
              </button>
            )}
            {steps.some(s => s.status !== "pending") && !isRunning && (
              <button onClick={reset} className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-jarvis-panel-border text-jarvis-text-muted hover:text-jarvis-text transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="max-w-2xl mx-auto w-full mt-8 space-y-3">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
            className={cn(
              "rounded-xl border overflow-hidden transition-all duration-500",
              step.status === "running" && "border-[#F5A623] shadow-[0_0_20px_rgba(245,166,35,0.1)]",
              step.status === "success" && "border-[#34F5D0]/50",
              step.status === "error" && "border-[#FF4D4D]/50",
              step.status === "pending" && "border-jarvis-panel-border opacity-40",
            )}
          >
            {/* Step Header */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-3",
              step.status === "running" && "bg-[#F5A623]/5",
              step.status === "success" && "bg-[#34F5D0]/5",
              step.status === "error" && "bg-[#FF4D4D]/5",
              step.status === "pending" && "bg-jarvis-panel/10",
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                step.status === "running" && "border-[#F5A623] bg-[#F5A623]/10",
                step.status === "success" && "border-[#34F5D0] bg-[#34F5D0]/10",
                step.status === "error" && "border-[#FF4D4D] bg-[#FF4D4D]/10",
                step.status === "pending" && "border-jarvis-panel-border bg-jarvis-panel/30",
              )}>
                {step.status === "running" ? (
                  <Loader2 className="size-4 text-[#F5A623] animate-spin" />
                ) : step.status === "success" ? (
                  <CheckCircle2 className="size-4 text-[#34F5D0]" />
                ) : step.status === "error" ? (
                  <AlertCircle className="size-4 text-[#FF4D4D]" />
                ) : (
                  <span className="text-xs font-bold text-jarvis-text-muted">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-jarvis-text">{step.name}</span>
                <p className="text-[10px] text-jarvis-text-muted">{step.description}</p>
              </div>
              {step.status === "running" && (
                <span className="text-[10px] font-mono text-[#F5A623] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
                  Running
                </span>
              )}
            </div>

            {/* Step Output */}
            <AnimatePresence>
              {(step.status === "running" || step.status === "success") && step.result && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-jarvis-panel-border/30"
                >
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-jarvis-bg/50">
                    <Terminal className="size-2.5 text-jarvis-text-muted" />
                    <span className="text-[9px] font-mono text-jarvis-text-muted uppercase tracking-widest">Output</span>
                    <span className="ml-auto text-[9px] font-mono text-jarvis-text-muted">{step.result.length} chars</span>
                  </div>
                  <div className="p-3 max-h-40 overflow-y-auto">
                    <pre className="text-[11px] font-mono text-jarvis-text/80 whitespace-pre-wrap leading-relaxed">
                      {step.result}
                      {step.status === "running" && <span className="inline-block w-1.5 h-3 bg-[#F5A623] ml-0.5 animate-pulse" />}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Connecting lines between steps */}
        {steps.length > 1 && (
          <div className="flex justify-center">
            <div className="w-px h-6 bg-gradient-to-b from-jarvis-primary/30 to-jarvis-primary/10" />
          </div>
        )}
      </div>

      {/* Final Post Preview */}
      <AnimatePresence>
        {post && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto w-full mt-8 space-y-4"
          >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#34F5D0]" />
                  Final Post — Ready to Review
                </h3>
                <span className="text-[10px] font-mono text-jarvis-text-muted bg-jarvis-panel px-2 py-1 rounded">
                  {post.caption.length} chars
                </span>
              </div>

            <div className="bg-jarvis-panel border border-jarvis-panel-border rounded-xl p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Title</span>
                <p className="text-base font-bold text-jarvis-text mt-1">{post.title}</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Caption</span>
                  <button onClick={copyCaption} className="flex items-center gap-1 text-[10px] text-jarvis-text-muted hover:text-jarvis-primary transition-colors">
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-sm text-jarvis-text/80 mt-1 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
              </div>
              {post.hashtags.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="size-3" /> Hashtags
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {post.hashtags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded bg-jarvis-primary/5 border border-jarvis-primary/20 text-[11px] text-jarvis-primary font-mono">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {post.mediaIdeas.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <Target className="size-3" /> Media Ideas
                  </span>
                  <ul className="mt-1.5 space-y-1">
                    {post.mediaIdeas.map((idea, i) => (
                      <li key={i} className="text-sm text-jarvis-text/70 flex items-start gap-2"><span className="text-jarvis-primary mt-1">▸</span>{idea}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <span className="text-[10px] font-mono text-jarvis-primary flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" />
              Redirecting to Create Page...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRunning && currentStepIndex < 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
          <Sparkles className="size-12 mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest text-center">Enter a topic above to start the content pipeline</p>
          <p className="text-[10px] font-mono text-jarvis-text-muted/50 mt-2">Research Agent → Content Publisher → Ready to Post</p>
        </div>
      )}
    </div>
  );
}

export function AgentPipelineWithResearch() {
  const [ctx] = useState(() => getResearchContext());

  useEffect(() => {
    if (ctx) clearResearchContext();
  }, []);

  if (!ctx) return <AgentPipeline />;

  return <AgentPipeline key="from-research" initialTopic={ctx.topic} initialContext={ctx.context} />;
}
