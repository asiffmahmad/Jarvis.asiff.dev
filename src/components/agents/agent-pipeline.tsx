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
  // Node coordinates inside 650x450 graph space
  x: number;
  y: number;
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

  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: "automation_planner",
      name: "Automation Planner",
      description: "Plans tasks and structures automated posts",
      status: "pending",
      result: "",
      systemPrompt: `You are the overarching Automation Planner Agent. You control the full application's automation strategy. 
Analyze the user's input topic and generate a daily automated content plan, including predefined AI news posts.
Return the output STRICTLY as a JSON structure (no markdown or code fences) matching this format:
{
  "title": "Post Title",
  "caption": "Your detailed plan and daily AI news post",
  "hashtags": ["tag1", "tag2"],
  "mediaIdeas": ["idea1", "idea2"],
  "callToAction": "clear call to action",
  "platform": "linkedin",
  "bestPostingTime": "09:00 AM"
}`,
      operation: "Planning automation...",
      color: "#34F5D0", // Cyan
      icon: Cpu,
      x: 325,
      y: 210,
    }
  ]);

  const connectionPaths: string[] = [];

  const reset = useCallback(() => {
    setSteps(s => s.map(st => ({ ...st, status: "pending" as const, result: "" })));
    setCurrentStepIndex(-1);
    setPost(null);
    setIsRunning(false);
    abortRef.current = null;
    hasNavigatedRef.current = false;
  }, []);

  useEffect(() => {
    if (initialTopic && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const timer = setTimeout(() => handleStart(), 500);
      return () => clearTimeout(timer);
    }
  }, [initialTopic]);

  const runPipelineFromStep = async (startIndex: number, promptInput: string) => {
    if (!abortRef.current) abortRef.current = new AbortController();
    
    setIsRunning(true);

    try {
      setCurrentStepIndex(0);
      setSteps(s => {
        const c = [...s];
        c[0] = { ...c[0], status: "running", result: "" };
        return c;
      });

      const agentPrompt = `Input Data:\n${promptInput}\n\nUser Theme: ${topic.trim()}`;
      const result = await streamAgent(
        steps[0].systemPrompt,
        agentPrompt,
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
        c[0] = { ...c[0], status: "success", result };
        return c;
      });

      const finalJson = result;
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
      setIsRunning(false);
      setSteps(s => s.map(st => st.status === "running" ? { ...st, status: "error" as const, result: (err as Error).message } : st));
    }
  };

  const handleStart = async () => {
    if (!topic.trim() || isRunning) return;
    reset();
    const input = initialContext
      ? `Topic: ${topic.trim()}\n\nSource Context/Article Content:\n${initialContext}`
      : topic.trim();
    runPipelineFromStep(0, input);
  };

  // Auto-navigate to /create when a post is generated successfully
  useEffect(() => {
    if (post && !isRunning && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const timer = setTimeout(async () => {
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 2000); // 2-second timeout for DB save

          await fetch("/api/publish/draft", {
            method: "POST",
            signal: controller.signal,
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
          clearTimeout(id);
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

  const activeStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-jarvis-bg-deepest/20">
      
      {/* Top Glassmorphic Prompt Input */}
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
        
        {/* Left Side: SVG Particle Network Graph */}
        <div className="flex-[3] p-4 overflow-hidden flex flex-col justify-center items-center relative border-r border-jarvis-panel/30 min-w-0 select-none">
          
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

          {/* SVG Canvas Workspace */}
          <div className="w-full max-w-[650px] h-[440px] relative shrink-0">
            
            {/* Connection Lines & Flowing Communication Particles */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 650 420">
              
              {/* Glow filter definition */}
              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Render Curved Connection Paths */}
              {steps.map((step, idx) => {
                if (idx >= steps.length - 1) return null;
                const pathD = connectionPaths[idx];
                const isLineActive = currentStepIndex === idx && isRunning;
                const strokeColor = isLineActive ? step.color : "rgba(255,255,255,0.06)";
                
                return (
                  <g key={`path-${idx}`}>
                    {/* Underlying Glow Curve */}
                    {isLineActive && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={step.color}
                        strokeWidth="4"
                        opacity="0.3"
                        filter="url(#neon-glow)"
                      />
                    )}
                    {/* Core Curve */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isLineActive ? "2" : "1.2"}
                      strokeDasharray={isLineActive ? "4,4" : "0"}
                      className={cn(isLineActive && "animate-[dash_8s_linear_infinite]")}
                    />

                    {/* Flowing Data Particle (glowing dot travelling along the Bezier path) */}
                    {isLineActive && (
                      <circle r="4.5" fill={step.color} filter="url(#neon-glow)">
                        <animateMotion
                          dur="2.2s"
                          repeatCount="indefinite"
                          path={pathD}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}


            </svg>

            {/* Render Nodes Absolutely atop the SVG coords */}
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStepIndex === idx && isRunning;
              
              return (
                <div
                  key={step.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                  style={{ left: step.x, top: step.y }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-jarvis-panel/90 glass-strong relative",
                      step.status === "running" && "animate-pulse"
                    )}
                    style={{
                      borderColor: step.status !== "pending" ? step.color : "rgba(255,255,255,0.1)",
                      boxShadow: isActive ? `0 0 25px ${step.color}60` : "none"
                    }}
                  >
                    {/* Ring Pulse for Active Node */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full animate-ping opacity-25 border-2" style={{ borderColor: step.color }} />
                    )}

                    {/* Agent's Central Icon (always visible) */}
                    <Icon className="size-8 transition-colors duration-500" style={{ color: step.status !== "pending" ? step.color : "rgba(255,255,255,0.3)" }} />

                    {/* Status Badge overlay (bottom-right) */}
                    {step.status !== "pending" && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border border-jarvis-panel bg-jarvis-bg shadow-md">
                        {step.status === "running" && (
                          <Loader2 className="size-3.5 animate-spin" style={{ color: step.color }} />
                        )}
                        {step.status === "success" && (
                          <CheckCircle2 className="size-3.5 text-[#34F5D0]" />
                        )}
                        {step.status === "failed_validation" && (
                          <RefreshCw className="size-3.5 text-red-400 animate-spin" />
                        )}
                        {step.status === "error" && (
                          <AlertCircle className="size-3.5 text-red-500" />
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* Absolute Node Labels */}
                  <span 
                    className="text-[9px] font-bold uppercase font-mono tracking-widest mt-1.5 px-2 py-0.5 rounded-md bg-jarvis-bg/90 border border-jarvis-panel-border/40"
                    style={{ color: step.status !== "pending" ? step.color : "rgba(255,255,255,0.4)" }}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}

          </div>

          {!isRunning && currentStepIndex < 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-jarvis-bg-deepest/50 backdrop-blur-[2px] z-20">
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
            


            {/* active step text or logs stream */}
            {activeStep && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-jarvis-panel-border/20 pb-1.5 text-jarvis-text-muted uppercase tracking-widest text-[9px] font-bold">
                  <span style={{ color: activeStep.color }}>Active Agent: {activeStep.name}</span>
                </div>
                <div className="p-3 bg-jarvis-panel/20 border border-jarvis-panel-border/40 rounded-xl max-h-[220px] overflow-y-auto shadow-inner">
                  <pre className="text-[11px] whitespace-pre-wrap leading-relaxed text-jarvis-text/90">
                    {activeStep.result || `> Launching execution channel for ${activeStep.name}...`}
                    {activeStep.status === "running" && <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse" style={{ backgroundColor: activeStep.color }} />}
                  </pre>
                </div>
              </div>
            )}

            {/* Prior Steps Log Cards */}
            <div className="space-y-2.5">
              {steps.filter(s => s.status === "success" || s.status === "failed_validation").map(s => (
                <div key={`log-${s.id}`} className="border border-jarvis-panel-border/30 rounded-xl overflow-hidden text-[11px]">
                  <div className="px-3 py-1.5 bg-jarvis-panel/20 border-b border-jarvis-panel-border/20 flex justify-between items-center text-jarvis-text-muted">
                    <span className="font-bold uppercase tracking-wider" style={{ color: s.color }}>{s.name} Log</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-jarvis-panel/40 font-bold uppercase tracking-wider">DONE</span>
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
                className="border border-[#34F5D0]/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(52,245,208,0.05)]"
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
