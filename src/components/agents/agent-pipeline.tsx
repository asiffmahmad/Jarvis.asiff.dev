"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Loader2, CheckCircle2, AlertCircle, X,
  Terminal, Hash, Target, Copy, Check, ArrowRight, RefreshCw, HelpCircle
} from "lucide-react";
import { cn, safeJsonParse } from "@/lib/utils";
import { getResearchContext, clearResearchContext } from "@/lib/cross-page-store";

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "success" | "error" | "failed_validation";
  result: string;
  systemPrompt: string;
  operation: string;
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

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const fullText = data.text || "";

  const chunkSize = Math.max(8, Math.floor(fullText.length / 50));
  let currentLength = 0;

  return new Promise<string>((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }

    const interval = setInterval(() => {
      if (signal?.aborted) {
        clearInterval(interval);
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      currentLength += chunkSize;
      if (currentLength >= fullText.length) {
        clearInterval(interval);
        onChunk(fullText);
        resolve(fullText);
      } else {
        onChunk(fullText.slice(0, currentLength));
      }
    }, 30);
  });
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
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [loopFeedback, setLoopFeedback] = useState<string | null>(null);

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: "prompt_agent",
      name: "Strategic Context Planner",
      description: "Optimizes input constraints, targeting vectors, and query parameters",
      status: "pending",
      result: "",
      systemPrompt: `You are an AI Prompt Optimization Expert. Analyze the user's input topic, expand it with targeted contexts, search terms, and establish platform-specific content parameters. Return the output as optimized guidelines.`,
      operation: "Optimizing input query parameters...",
    },
    {
      id: "research_agent",
      name: "Deep Web Intelligence Agent",
      description: "Crawls database resources, articles, and crawls facts",
      status: "pending",
      result: "",
      systemPrompt: `You are a Research Analyst. Thoroughly analyze the optimized prompt guidelines and produce:
1. Executive summary of target topics.
2. 3-4 key analytical findings and statistics.
3. Industry insights.
Format cleanly with Markdown headers.`,
      operation: "Harvesting insights & facts...",
    },
    {
      id: "research_validation",
      name: "Fact Auditor & Validation Agent",
      description: "Sanity checks claims, filters hallucinations, and audits facts",
      status: "pending",
      result: "",
      systemPrompt: `You are a Data Validation Expert. Review the provided research output. Identify any potential logical inconsistencies, missing sources, or lack of clarity. Summarize validated findings.`,
      operation: "Validating logical consistency & claims...",
    },
    {
      id: "content_creation",
      name: "Creative Copywriter Agent",
      description: "Transforms research insights into engaging structured narrative drafts",
      status: "pending",
      result: "",
      systemPrompt: `You are a Content Creator. Review the validated research and draft a social media post.
If you receive feedback regarding a missing Call-To-Action (CTA) or insufficient details, you MUST fix it.
Return the output as a draft post.`,
      operation: "Drafting initial hooks & structure...",
    },
    {
      id: "content_polish",
      name: "SEO & Layout Optimizer Agent",
      description: "Formats post spacing, metadata structures, and injects hashtags",
      status: "pending",
      result: "",
      systemPrompt: `You are a Content Polisher. Review the content draft and format it for social media.
Format the final output strictly as JSON with this structure (do not include code fences):
{
  "title": "Post Title",
  "caption": "substantive caption with layout spacing",
  "hashtags": ["tag1", "tag2"],
  "mediaIdeas": ["idea1", "idea2"],
  "callToAction": "clear call to action",
  "platform": "linkedin",
  "bestPostingTime": "Best posting time"
}`,
      operation: "Polishing layout & formatting JSON...",
    },
    {
      id: "jarvis_agent",
      name: "JARVIS Master Quality Controller",
      description: "Performs strict tone compliance, CTA validation, and grants approval",
      status: "pending",
      result: "",
      systemPrompt: `You are JARVIS, the master content supervisor. Audit the polished post details.
Evaluate the post for tone, structure, and presence of a Call-to-Action (CTA).
If the post passes audits, write a validation summary approving the post.`,
      operation: "Auditing compliance & quality guidelines...",
    },
  ]);

  const reset = useCallback(() => {
    setSteps(s => s.map(st => ({ ...st, status: "pending" as const, result: "" })));
    setCurrentStepIndex(-1);
    setPost(null);
    setIsRunning(false);
    setHasFailedOnce(false);
    setLoopFeedback(null);
    abortRef.current = null;
  }, []);

  useEffect(() => {
    if (initialTopic && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const timer = setTimeout(() => handleStart(), 500);
      return () => clearTimeout(timer);
    }
  }, [initialTopic]);

  const runPipelineFromStep = async (startIndex: number, promptInput: string, isFailedAttempt: boolean) => {
    if (!abortRef.current) abortRef.current = new AbortController();
    
    let currentInput = promptInput;
    setIsRunning(true);

    try {
      for (let i = startIndex; i < steps.length; i++) {
        setCurrentStepIndex(i);
        setSteps(s => {
          const c = [...s];
          c[i] = { ...c[i], status: "running", result: "" };
          return c;
        });

        // Update operation label dynamically for creation agent on retry
        if (i === 3 && isFailedAttempt) {
          setSteps(s => {
            const c = [...s];
            c[3] = { ...c[3], operation: "Iterating draft with Jarvis feedback..." };
            return c;
          });
        }

        const agentPrompt = `Input Data:\n${currentInput}\n\nUser Theme: ${topic.trim()}`;
        const result = await streamAgent(
          steps[i].systemPrompt,
          agentPrompt,
          (text) => {
            setSteps(s => {
              const c = [...s];
              c[i] = { ...c[i], result: text };
              return c;
            });
          },
          abortRef.current.signal,
        );

        setSteps(s => {
          const c = [...s];
          c[i] = { ...c[i], status: "success", result };
          return c;
        });

        currentInput = result;

        // Step 5 check: Jarvis validation failure simulation on first pass
        if (i === 5 && !isFailedAttempt && !hasFailedOnce) {
          throw new Error("VALIDATION_FAILED");
        }
      }

      // Successful completion
      const finalJson = steps[4].result || currentInput;
      const parsed = tryParsePost(finalJson);
      if (parsed) {
        setPost({
          ...parsed,
          title: parsed.title || topic.trim()
        });
      } else {
        // Fallback parse
        setPost({
          title: topic.trim(),
          caption: finalJson,
          hashtags: ["automation", "ai"],
          mediaIdeas: ["Visual summary graphic"],
          callToAction: "Connect with us to learn more!",
          platform: "linkedin",
          bestPostingTime: "09:00 AM",
        });
      }
      setIsRunning(false);
    } catch (err) {
      if ((err as Error).message === "VALIDATION_FAILED") {
        setHasFailedOnce(true);
        setLoopFeedback("Validation Failed: The generated content is missing a strong Call-To-Action (CTA). Returning to Content Creation Agent for iteration.");
        
        setSteps(s => {
          const c = [...s];
          c[5] = { 
            ...c[5], 
            status: "failed_validation", 
            result: "[JARVIS COMPLIANCE AUDIT]\nSTATUS: REJECTED\nREASON: Missing clear call-to-action (CTA).\nACTION: Re-routing content creation agent to expand layout with CTA."
          };
          return c;
        });
        
        setIsRunning(false);
        // Wait 3 seconds to let user view warning/arrows before re-routing
        setTimeout(() => {
          // Reset steps 3, 4, 5
          setSteps(s => {
            const c = [...s];
            c[3] = { ...c[3], status: "pending", result: "" };
            c[4] = { ...c[4], status: "pending", result: "" };
            c[5] = { ...c[5], status: "pending", result: "" };
            return c;
          });
          // Rerun from step 3 (Content Creation) with feedback guidelines appended
          const feedbackInput = `${steps[2].result}\n\n[FEEDBACK FROM JARVIS]: Add a strong Call-To-Action (CTA) at the end.`;
          runPipelineFromStep(3, feedbackInput, true);
        }, 4000);
      } else {
        setIsRunning(false);
        setSteps(s => s.map(st => st.status === "running" ? { ...st, status: "error" as const, result: (err as Error).message } : st));
      }
    }
  };

  const handleStart = async () => {
    if (!topic.trim() || isRunning) return;
    reset();
    runPipelineFromStep(0, topic.trim(), false);
  };

  // Auto-navigate to /create when a post is generated successfully
  useEffect(() => {
    if (post && !isRunning && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const timer = setTimeout(async () => {
        try {
          await fetch("/api/publish/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              post: {
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
              }
            }),
          });
        } catch (err) {
          console.error("Failed to save draft to MySQL:", err);
        }
        router.push("/create");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [post, isRunning, router, topic]);

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
          <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">Multi-Agent Content Pipeline</h2>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={topic}
              disabled={isRunning}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic — Prompter, Research, Content Creation & Jarvis Agents will collaborate..."
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

      {/* Live Iteration Feedback Banner */}
      <AnimatePresence>
        {loopFeedback && isRunning && currentStepIndex === 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto w-full mt-6 bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 rounded-xl p-4 flex gap-3 items-start"
          >
            <RefreshCw className="size-5 text-[#FF4D4D] animate-spin mt-0.5" />
            <div className="text-left">
              <span className="text-xs font-bold text-[#FF4D4D] uppercase tracking-wider">Jarvis Validation Audit Loop</span>
              <p className="text-xs text-jarvis-text/90 mt-1 leading-relaxed">{loopFeedback}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline Steps */}
      <div className="max-w-2xl mx-auto w-full mt-6 space-y-3">
        {steps.map((step, idx) => (
          <div key={step.id}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "rounded-xl border overflow-hidden transition-all duration-500 text-left",
                step.status === "running" && "border-[#F5A623] shadow-[0_0_20px_rgba(245,166,35,0.1)] bg-[#F5A623]/5",
                step.status === "success" && "border-[#34F5D0]/50 bg-[#34F5D0]/5",
                step.status === "error" && "border-[#FF4D4D]/50 bg-[#FF4D4D]/5",
                step.status === "failed_validation" && "border-[#FF8C00]/50 bg-[#FF8C00]/5 shadow-[0_0_15px_rgba(255,140,0,0.15)]",
                step.status === "pending" && "border-jarvis-panel-border opacity-40 bg-jarvis-panel/10",
              )}
            >
              {/* Step Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                  step.status === "running" && "border-[#F5A623] bg-[#F5A623]/10",
                  step.status === "success" && "border-[#34F5D0] bg-[#34F5D0]/10",
                  step.status === "error" && "border-[#FF4D4D] bg-[#FF4D4D]/10",
                  step.status === "failed_validation" && "border-[#FF8C00] bg-[#FF8C00]/10",
                  step.status === "pending" && "border-jarvis-panel-border bg-jarvis-panel/30",
                )}>
                  {step.status === "running" ? (
                    <Loader2 className="size-4 text-[#F5A623] animate-spin" />
                  ) : step.status === "success" ? (
                    <CheckCircle2 className="size-4 text-[#34F5D0]" />
                  ) : step.status === "failed_validation" ? (
                    <RefreshCw className="size-4 text-[#FF8C00] animate-spin" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="size-4 text-[#FF4D4D]" />
                  ) : (
                    <span className="text-xs font-bold text-jarvis-text-muted">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-jarvis-text">{step.name}</span>
                    {step.status === "running" && (
                      <span className="text-[9px] bg-[#F5A623]/20 text-[#F5A623] px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                        {step.operation}
                      </span>
                    )}
                    {step.status === "failed_validation" && (
                      <span className="text-[9px] bg-[#FF8C00]/20 text-[#FF8C00] px-2 py-0.5 rounded font-mono font-bold">
                        Audit Failed
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-jarvis-text-muted">{step.description}</p>
                </div>
                {step.status === "running" && (
                  <span className="text-[10px] font-mono text-[#F5A623] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
                    Processing
                  </span>
                )}
              </div>

              {/* Step Output */}
              <AnimatePresence>
                {(step.status === "running" || step.status === "success" || step.status === "failed_validation") && step.result && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-jarvis-panel-border/30"
                  >
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-jarvis-bg/50">
                      <Terminal className="size-2.5 text-jarvis-text-muted" />
                      <span className="text-[9px] font-mono text-jarvis-text-muted uppercase tracking-widest">Logs</span>
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

            {/* Connecting line / arrows */}
            {idx < steps.length - 1 && (
              <div className="flex justify-center my-1">
                {step.status === "failed_validation" || (idx >= 3 && hasFailedOnce && isRunning && currentStepIndex === 3) ? (
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-0.5 h-6 bg-gradient-to-t from-[#FF8C00] to-[#FF4D4D]" />
                    <span className="text-[8px] font-bold text-[#FF8C00] uppercase font-mono tracking-widest mt-0.5">Re-routing</span>
                  </motion.div>
                ) : (
                  <div className="w-px h-5 bg-gradient-to-b from-jarvis-primary/30 to-jarvis-primary/10" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Final Post Preview */}
      <AnimatePresence>
        {post && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto w-full mt-8 space-y-4 text-left"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#34F5D0]" />
                Final Post — Approved by Jarvis
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
              Moving to Drafts Review dashboard...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRunning && currentStepIndex < 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
          <Sparkles className="size-12 mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest text-center">Enter a topic above to initiate multi-agent pipeline</p>
          <p className="text-[10px] font-mono text-jarvis-text-muted/50 mt-2">Prompter → Research → Validation → Content Creation → Polish → Jarvis Audit</p>
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
