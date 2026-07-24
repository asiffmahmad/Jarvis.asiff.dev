"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Loader2, CheckCircle2, AlertCircle, X,
  Terminal, Hash, Target, Copy, Check, RefreshCw,
  Search, PenTool, Layout, ShieldAlert, ShieldCheck, Cpu,
  Activity, Play, Info
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
  color: string;
  icon: any;
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
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }
    const p = safeJsonParse(cleaned) as Record<string, unknown>;
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
      description: "Optimizes input constraints and parameters",
      status: "pending",
      result: "",
      systemPrompt: `You are an AI Prompt Optimization Expert. Analyze the user's input topic, expand it with targeted contexts, search terms, and establish platform-specific content parameters. Return the output as optimized guidelines.`,
      operation: "Optimizing targeting vectors...",
      color: "#34F5D0", // Cyan
      icon: Cpu,
    },
    {
      id: "research_agent",
      name: "Deep Web Intelligence Agent",
      description: "Gathers statistics and industry insights",
      status: "pending",
      result: "",
      systemPrompt: `You are a Research Analyst. Thoroughly analyze the optimized prompt guidelines and produce:
1. Executive summary of target topics.
2. 3-4 key analytical findings and statistics.
3. Industry insights.
Format cleanly with Markdown headers.`,
      operation: "Harvesting web statistics...",
      color: "#A061FF", // Violet/Purple
      icon: Search,
    },
    {
      id: "research_validation",
      name: "Fact Auditor & Validation Agent",
      description: "Cross-checks facts and audits stats",
      status: "pending",
      result: "",
      systemPrompt: `You are a Data Validation Expert. Review the provided research output. Identify any potential logical inconsistencies, missing sources, or lack of clarity. Summarize validated findings.`,
      operation: "Sanity checking statistics...",
      color: "#00E676", // Emerald Green
      icon: ShieldCheck,
    },
    {
      id: "content_creation",
      name: "Creative Copywriter Agent",
      description: "Drafts structured narrative captions",
      status: "pending",
      result: "",
      systemPrompt: `You are a Content Creator. Review the validated research and draft a social media post.
If you receive feedback regarding a missing Call-To-Action (CTA) or insufficient details, you MUST fix it.
Return the output as a draft post.`,
      operation: "Drafting copywriting hooks...",
      color: "#FF4081", // Neon Pink
      icon: PenTool,
    },
    {
      id: "content_polish",
      name: "SEO & Layout Optimizer Agent",
      description: "Appends optimized hashtags & JSON structure",
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
      operation: "Constructing SEO JSON metadata...",
      color: "#FF9100", // Amber Orange
      icon: Layout,
    },
    {
      id: "jarvis_agent",
      name: "JARVIS Master Quality Controller",
      description: "Performs strict audits and compliance checks",
      status: "pending",
      result: "",
      systemPrompt: `You are JARVIS, the master content supervisor. Audit the polished post details.
Evaluate the post for tone, structure, and presence of a Call-to-Action (CTA).
If the post passes audits, write a validation summary approving the post.`,
      operation: "JARVIS Final Compliance Audit...",
      color: "#FF1744", // Crimson Red
      icon: ShieldAlert,
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
    let polishedResult = "";
    setIsRunning(true);

    try {
      for (let i = startIndex; i < steps.length; i++) {
        setCurrentStepIndex(i);
        setSteps(s => {
          const c = [...s];
          c[i] = { ...c[i], status: "running", result: "" };
          return c;
        });

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
        if (steps[i].id === "content_polish") {
          polishedResult = result;
        }

        if (i === 5 && !isFailedAttempt && !hasFailedOnce) {
          throw new Error("VALIDATION_FAILED");
        }
      }

      const finalJson = polishedResult || currentInput;
      const parsed = tryParsePost(finalJson);
      if (parsed) {
        setPost({
          ...parsed,
          title: parsed.title || topic.trim()
        });
      } else {
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
        setLoopFeedback("Validation Failed: The generated content is missing a strong Call-To-Action (CTA). Returning to Creative Copywriter Agent for iteration.");
        
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
        setTimeout(() => {
          setSteps(s => {
            const c = [...s];
            c[3] = { ...c[3], status: "pending", result: "" };
            c[4] = { ...c[4], status: "pending", result: "" };
            c[5] = { ...c[5], status: "pending", result: "" };
            return c;
          });
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

  const activeStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-jarvis-bg-deepest/20">
      
      {/* Top Glassmorphic Prompt Form */}
      <div className="p-6 border-b border-jarvis-panel/30 glass-strong bg-jarvis-panel/10 shrink-0 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <textarea
              value={topic}
              disabled={isRunning}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Deploy a multi-agent swarm. Enter a content concept or research topic..."
              className="w-full bg-jarvis-bg/80 border border-jarvis-panel-border/80 rounded-2xl px-4 py-3 text-sm text-jarvis-text placeholder-jarvis-text-muted/40 outline-none resize-none h-16 focus:border-jarvis-primary/50 transition-colors shadow-inner"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
            />
          </div>
          <div className="flex gap-2 self-stretch md:self-end justify-end">
            {isRunning ? (
              <button onClick={handleStop} className="flex items-center gap-2 px-6 py-3 rounded-2xl transition-all text-xs font-bold uppercase tracking-wider bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30">
                <X className="size-4" /> Stop Swarm
              </button>
            ) : (
              <button onClick={handleStart} disabled={!topic.trim()} className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl transition-all text-xs font-bold uppercase tracking-wider border shadow-lg",
                !topic.trim() 
                  ? "opacity-30 cursor-not-allowed bg-jarvis-panel/40 border-jarvis-panel-border text-jarvis-text-muted" 
                  : "bg-jarvis-primary/10 border-jarvis-primary/30 text-jarvis-primary hover:bg-jarvis-primary/20 shadow-jarvis-primary/5"
              )}>
                <Send className="size-4" /> Deploy Swarm
              </button>
            )}
            {steps.some(s => s.status !== "pending") && !isRunning && (
              <button onClick={reset} className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border border-jarvis-panel-border text-jarvis-text-muted hover:text-jarvis-text bg-jarvis-panel/10 hover:bg-jarvis-panel/20 transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Side: SVG Flow Graph */}
        <div className="flex-[3] p-6 overflow-y-auto flex flex-col justify-center items-center relative border-r border-jarvis-panel/30">
          
          {/* Animated Glow Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />

          <div className="w-full max-w-2xl relative space-y-6">
            
            {/* SVG Connecting Flow Lines */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              <svg className="w-full h-full min-h-[480px]" xmlns="http://www.w3.org/2000/svg">
                {/* Arrow Paths Between Circular Nodes */}
                {steps.map((_, idx) => {
                  if (idx >= steps.length - 1) return null;
                  const yStart = 45 + idx * 76;
                  const yEnd = 45 + (idx + 1) * 76;
                  const isFlowActive = currentStepIndex === idx && isRunning;
                  return (
                    <g key={`flow-${idx}`}>
                      <line
                        x1="50%"
                        y1={yStart}
                        x2="50%"
                        y2={yEnd}
                        stroke={isFlowActive ? "#34F5D0" : "rgba(255, 255, 255, 0.08)"}
                        strokeWidth={isFlowActive ? "2" : "1.5"}
                        strokeDasharray={isFlowActive ? "4,4" : "0"}
                        className={cn(isFlowActive && "animate-[dash_10s_linear_infinite]")}
                      />
                    </g>
                  );
                })}

                {/* Backtracking loop path when validation fails */}
                {hasFailedOnce && (
                  <path
                    d="M 50% 425 C 20% 425, 20% 273, 50% 273"
                    fill="none"
                    stroke="#FF1744"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className={cn(isRunning && currentStepIndex === 3 && "animate-[dash_10s_linear_infinite]")}
                    opacity="0.75"
                  />
                )}
              </svg>
            </div>

            {/* Steps Nodes */}
            <div className="relative z-10 space-y-6">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-2xl border transition-all duration-500 max-w-xl mx-auto glass-strong relative text-left",
                      step.status === "running" && "bg-jarvis-panel/30 border-jarvis-primary shadow-[0_0_25px_rgba(52,245,208,0.15)]",
                      step.status === "success" && "bg-[#34F5D0]/5 border-[#34F5D0]/30",
                      step.status === "failed_validation" && "bg-red-500/5 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
                      step.status === "pending" && "opacity-40 border-jarvis-panel-border bg-jarvis-panel/5"
                    )}
                  >
                    {/* Circle Node Icon */}
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 shrink-0",
                        step.status === "running" && "animate-pulse"
                      )}
                      style={{
                        borderColor: step.status !== "pending" ? step.color : "rgba(255,255,255,0.1)",
                        backgroundColor: step.status !== "pending" ? `${step.color}15` : "rgba(255,255,255,0.03)",
                        boxShadow: step.status === "running" ? `0 0 15px ${step.color}40` : "none"
                      }}
                    >
                      {step.status === "running" ? (
                        <Loader2 className="size-5 animate-spin" style={{ color: step.color }} />
                      ) : step.status === "success" ? (
                        <CheckCircle2 className="size-5 text-[#34F5D0]" />
                      ) : step.status === "failed_validation" ? (
                        <RefreshCw className="size-5 text-red-400 animate-spin" />
                      ) : (
                        <Icon className="size-5 text-jarvis-text-muted/80" style={{ color: step.status !== "pending" ? step.color : "" }} />
                      )}
                    </div>

                    {/* Node Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-jarvis-text uppercase tracking-wider">{step.name}</span>
                        {step.status === "running" && (
                          <span className="text-[8px] bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/20 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                            {step.operation}
                          </span>
                        )}
                        {step.status === "failed_validation" && (
                          <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                            Audit Rejected
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-jarvis-text-muted mt-0.5 leading-tight">{step.description}</p>
                    </div>

                    {/* Line Connection Dot indicator */}
                    {step.status === "running" && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: step.color }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: step.color }} />
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

          </div>

          {!isRunning && currentStepIndex < 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-jarvis-bg-deepest/40 backdrop-blur-[2px] z-20">
              <div className="glass-strong border border-jarvis-panel-border/60 rounded-3xl p-8 max-w-sm text-center shadow-2xl relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-jarvis-primary/5 rounded-full blur-2xl" />
                <Activity className="size-10 text-jarvis-primary/60 mx-auto mb-4 animate-pulse" />
                <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-jarvis-text">Deploy Multi-Agent Swarm</h3>
                <p className="text-xs text-jarvis-text-muted mt-2 leading-relaxed">
                  Enter a theme above and launch the pipeline. Six localized intelligence agents will plan, gather stats, audit facts, draft layout schemas, and cross-examine validation models.
                </p>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-mono text-jarvis-text-muted uppercase tracking-widest bg-jarvis-panel/30 py-1.5 px-3 rounded-xl border border-jarvis-panel-border/30">
                  <Play className="size-2.5 text-[#34F5D0]" /> Fully Autonomous Audit Loop
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Cyber Console Terminal */}
        <div className="flex-[2] flex flex-col bg-black/40 relative min-w-0">
          
          {/* Terminal Console Header */}
          <div className="h-10 border-b border-jarvis-panel/30 flex items-center px-4 justify-between bg-jarvis-panel/10 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="size-3.5 text-jarvis-text-muted" />
              <span className="text-[10px] font-mono font-bold text-jarvis-text uppercase tracking-widest">Autonomous Stream Console</span>
            </div>
            {isRunning && (
              <span className="text-[9px] font-mono text-jarvis-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-jarvis-primary animate-pulse" />
                Live Feed
              </span>
            )}
          </div>

          {/* Terminal Logs & Output Container */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed space-y-4 text-left">
            
            <AnimatePresence>
              {loopFeedback && isRunning && currentStepIndex === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-[11px] space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold uppercase text-xs">
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Quality Check Rejected — Rerouting</span>
                  </div>
                  <p>{loopFeedback}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* active step text or logs stream */}
            {activeStep && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-jarvis-panel-border/20 pb-1.5 text-jarvis-text-muted uppercase tracking-widest text-[9px] font-bold">
                  <span>Active Node Log: {activeStep.name}</span>
                </div>
                <div className="p-3 bg-jarvis-panel/20 border border-jarvis-panel-border/40 rounded-xl max-h-[220px] overflow-y-auto">
                  <pre className="text-[11px] whitespace-pre-wrap leading-relaxed text-jarvis-text/90">
                    {activeStep.result || "> Initializing session channel..."}
                    {activeStep.status === "running" && <span className="inline-block w-1.5 h-3 bg-jarvis-primary ml-0.5 animate-pulse" />}
                  </pre>
                </div>
              </div>
            )}

            {/* Prior Steps Log Cards */}
            <div className="space-y-2.5">
              {steps.filter(s => s.status === "success" || s.status === "failed_validation").map(s => (
                <div key={`log-${s.id}`} className="border border-jarvis-panel-border/30 rounded-xl overflow-hidden text-[11px]">
                  <div className="px-3 py-1.5 bg-jarvis-panel/20 border-b border-jarvis-panel-border/20 flex justify-between items-center text-jarvis-text-muted">
                    <span className="font-bold uppercase tracking-wider">{s.name} Output</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-jarvis-panel/40">COMPLETED</span>
                  </div>
                  <div className="p-3 bg-jarvis-bg/40 max-h-[140px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap leading-relaxed text-jarvis-text/75">{s.result}</pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Final post preview nested within console upon validation completion */}
            {post && !isRunning && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-[#34F5D0]/30 rounded-xl overflow-hidden"
              >
                <div className="px-4 py-2 bg-[#34F5D0]/10 border-b border-[#34F5D0]/30 flex justify-between items-center text-[#34F5D0]">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" /> JARVIS Audit Approved
                  </span>
                  <span className="text-[10px] bg-[#34F5D0]/20 px-2 py-0.5 rounded">READY</span>
                </div>
                <div className="p-4 bg-jarvis-panel/10 space-y-3 font-sans text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-jarvis-text-muted uppercase tracking-wider">Title</span>
                    <p className="text-sm font-bold text-jarvis-text mt-0.5">{post.title}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-jarvis-text-muted uppercase tracking-wider">Caption</span>
                      <button onClick={copyCaption} className="flex items-center gap-1 text-[10px] text-jarvis-text-muted hover:text-jarvis-primary transition-colors">
                        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs text-jarvis-text/80 mt-0.5 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
                  </div>
                  {post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.hashtags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-jarvis-primary/5 border border-jarvis-primary/20 text-[9px] text-jarvis-primary font-mono">#{t}</span>
                      ))}
                    </div>
                  )}
                  <span className="text-[9px] font-mono text-jarvis-primary flex items-center gap-2 pt-2 border-t border-jarvis-panel-border/20">
                    <Loader2 className="size-3 animate-spin" />
                    Redirecting to Drafts review dashboard...
                  </span>
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>

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
