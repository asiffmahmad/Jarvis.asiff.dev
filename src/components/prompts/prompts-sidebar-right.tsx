"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Terminal, Settings, Copy, Check, Play, Square, Tag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptEditor } from "./prompt-editor";
import { cn } from "@/lib/utils";
import type { PromptVariable, PromptCategory } from "@/lib/prompts/types";
import type { PromptState } from "@/lib/prompts/use-prompts";
import ReactMarkdown from "react-markdown";

interface PromptsSidebarRightProps {
  promptState: PromptState;
}

export function PromptsSidebarRight({ promptState }: PromptsSidebarRightProps) {
  const { activePrompt, updatePrompt } = promptState;
  const [activeTab, setActiveTab] = useState<"editor" | "execute">("editor");
  
  // Execution state
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Stop execution controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync variables on change
  useEffect(() => {
    if (activePrompt) {
      const initialVals: Record<string, string> = {};
      activePrompt.variables.forEach((v: PromptVariable) => {
        // preserve existing if available
        initialVals[v.name] = variableValues[v.name] || v.defaultValue || "";
      });
      // We only want to set initial values if keys are missing
      setVariableValues(prev => ({ ...initialVals, ...prev }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePrompt?.id]); // removed activePrompt.variables and variableValues to avoid loop

  if (!activePrompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(executionResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    if (isExecuting) {
      // Abort
      abortControllerRef.current?.abort();
      setIsExecuting(false);
      return;
    }

    setIsExecuting(true);
    setExecutionResult("");
    
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/prompts/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptContent: activePrompt.content,
          variables: variableValues,
          modelName: "groq"
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
              setExecutionResult(prev => prev + content);
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setExecutionResult(prev => prev + `\n\n[ERROR: ${(err as Error).message}]`);
      } else {
        setExecutionResult(prev => prev + `\n\n[EXECUTION ABORTED]`);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <motion.aside
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="w-[450px] flex-shrink-0 h-full border-l border-jarvis-panel/50 glass-strong bg-jarvis-panel/30 backdrop-blur-md relative z-20 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-jarvis-panel/30">
        <input
          value={activePrompt.title}
          onChange={(e) => updatePrompt(activePrompt.id, { title: e.target.value })}
          className="w-full bg-transparent text-lg font-heading font-bold text-jarvis-text focus:outline-none focus:ring-0 placeholder-jarvis-text-muted mb-2 text-glow"
          placeholder="Prompt Title"
        />
        
        <input
          value={activePrompt.description}
          onChange={(e) => updatePrompt(activePrompt.id, { description: e.target.value })}
          className="w-full bg-transparent text-xs text-jarvis-text-muted focus:outline-none focus:ring-0 placeholder-jarvis-text-muted/50"
          placeholder="Add a description..."
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 pt-2 border-b border-jarvis-panel/30">
        <button
          onClick={() => setActiveTab("editor")}
          className={cn(
            "px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider transition-colors border-b-2",
            activeTab === "editor"
              ? "border-jarvis-primary text-jarvis-primary text-glow"
              : "border-transparent text-jarvis-text-muted hover:text-jarvis-text"
          )}
        >
          Editor & Meta
        </button>
        <button
          onClick={() => setActiveTab("execute")}
          className={cn(
            "px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider transition-colors border-b-2",
            activeTab === "execute"
              ? "border-jarvis-primary text-jarvis-primary text-glow"
              : "border-transparent text-jarvis-text-muted hover:text-jarvis-text"
          )}
        >
          Execute
        </button>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === "editor" ? (
          <div className="p-4 space-y-6">
            <div className="h-[300px]">
              <PromptEditor 
                prompt={activePrompt} 
                onUpdate={(updates) => updatePrompt(activePrompt.id, updates)} 
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-jarvis-text-muted flex items-center gap-2">
                <Tag className="size-3" /> Metadata
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-jarvis-text-muted uppercase tracking-wider">Category</label>
                  <select
                    value={activePrompt.category}
                    onChange={(e) => updatePrompt(activePrompt.id, { category: e.target.value as PromptCategory })}
                    className="w-full bg-jarvis-bg-deep/50 border border-jarvis-panel-border/30 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:border-jarvis-primary"
                  >
                    {["Content Creation", "Social Media", "Carousel", "Email", "Research", "Coding", "Translation", "Productivity", "Marketing", "Custom"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-jarvis-text-muted uppercase tracking-wider">Tags (comma separated)</label>
                  <input
                    value={activePrompt.tags.join(", ")}
                    onChange={(e) => updatePrompt(activePrompt.id, { tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                    className="w-full bg-jarvis-bg-deep/50 border border-jarvis-panel-border/30 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:border-jarvis-primary"
                    placeholder="e.g. sales, b2b"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-jarvis-text-muted flex items-center gap-2">
                <Settings className="size-3" /> Variables
              </h3>
              {activePrompt.variables.length === 0 ? (
                <p className="text-xs text-jarvis-text-muted italic bg-jarvis-bg-deep/30 p-3 rounded-lg border border-jarvis-panel-border/20">
                  No variables detected. Type {"{{"}variable_name{"}}"} in the editor to create one.
                </p>
              ) : (
                <div className="space-y-2">
                  {activePrompt.variables.map((v: PromptVariable) => (
                    <div key={v.name} className="bg-jarvis-bg-deep/50 border border-jarvis-panel-border/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono text-jarvis-primary bg-jarvis-primary/10 px-1.5 py-0.5 rounded">
                          {v.name}
                        </code>
                        <span className="text-[10px] uppercase text-jarvis-text-muted tracking-wider">
                          Type: {v.type}
                        </span>
                      </div>
                      <input
                        value={v.defaultValue || ""}
                        onChange={(e) => {
                          const newVars = activePrompt.variables.map((v2: PromptVariable) => v2.name === v.name ? { ...v2, defaultValue: e.target.value } : v2);
                          updatePrompt(activePrompt.id, { variables: newVars });
                        }}
                        className="w-full bg-transparent border-b border-jarvis-panel-border/50 text-xs px-1 py-1 focus:outline-none focus:border-jarvis-primary"
                        placeholder="Default value (optional)"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="p-4 space-y-6 flex flex-col h-full">
            
            {/* Variable Inputs */}
            {activePrompt.variables.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-jarvis-text-muted">
                  Set Variables
                </h3>
                <div className="space-y-2 bg-jarvis-panel/20 p-3 rounded-xl border border-jarvis-panel-border/30">
                  {activePrompt.variables.map((v: PromptVariable) => (
                    <div key={v.name} className="flex items-center gap-3">
                      <label className="text-xs text-jarvis-text-muted font-mono w-24 shrink-0 text-right">
                        {v.name}
                      </label>
                      <input
                        value={variableValues[v.name] || ""}
                        onChange={(e) => setVariableValues(prev => ({ ...prev, [v.name]: e.target.value }))}
                        className="flex-1 bg-jarvis-bg-deep/80 border border-jarvis-panel-border/50 rounded text-sm px-2 py-1.5 focus:outline-none focus:border-jarvis-primary"
                        placeholder={`e.g. ${v.defaultValue || "..."}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(52,245,208,0.15)]",
                isExecuting 
                  ? "bg-jarvis-danger/20 text-jarvis-danger border border-jarvis-danger/50 hover:bg-jarvis-danger/30"
                  : "bg-jarvis-primary/10 text-jarvis-primary border border-jarvis-primary/50 hover:bg-jarvis-primary hover:text-jarvis-bg-deepest"
              )}
            >
              {isExecuting ? (
                <>
                  <Square className="size-4" fill="currentColor" />
                  Stop Generation
                </>
              ) : (
                <>
                  <Play className="size-4" fill="currentColor" />
                  Execute Prompt
                </>
              )}
            </button>

            {/* Output Panel */}
            <div className="flex-1 flex flex-col mt-4 min-h-[300px] border border-jarvis-panel-border/40 rounded-xl overflow-hidden bg-jarvis-bg-deep/50 relative">
              <div className="flex items-center justify-between p-2 bg-jarvis-panel/40 border-b border-jarvis-panel-border/40">
                <span className="text-xs font-heading tracking-widest uppercase text-jarvis-text-muted flex items-center gap-2">
                  <Terminal className="size-3" /> Output
                </span>
                <button
                  onClick={handleCopy}
                  disabled={!executionResult}
                  className="p-1 text-jarvis-text-muted hover:text-jarvis-text disabled:opacity-30 transition-colors"
                >
                  {copied ? <Check className="size-3 text-jarvis-success" /> : <Copy className="size-3" />}
                </button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 prose prose-invert prose-jarvis max-w-none text-sm">
                  {executionResult ? (
                    <ReactMarkdown>{executionResult}</ReactMarkdown>
                  ) : (
                    <span className="text-jarvis-text-muted/50 italic flex items-center justify-center h-full pt-10">
                      Output will stream here...
                    </span>
                  )}
                  {isExecuting && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-jarvis-primary animate-pulse" />
                  )}
                </div>
              </ScrollArea>
            </div>

          </div>
        )}
      </ScrollArea>
    </motion.aside>
  );
}
