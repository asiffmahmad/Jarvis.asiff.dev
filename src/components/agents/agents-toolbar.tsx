"use client";

import { motion } from "framer-motion";
import { Play, Square, RotateCcw, Download, Send } from "lucide-react";
import type { AgentsState } from "@/lib/agents/use-agents";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  state: AgentsState;
  mode: "agent" | "post" | "pipeline";
}

export function AgentsToolbar({ state, mode }: ToolbarProps) {
  if (mode === "pipeline") return null;

  const { activeAgent, executionState, executeAgent, stopExecution, resetExecution, prompt, setPrompt } = state;

  const isRunning = executionState.status === "running";
  const hasFinished = executionState.status === "success" || executionState.status === "error";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isRunning && activeAgent) {
      e.preventDefault();
      executeAgent();
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-jarvis-panel border border-jarvis-panel-border shadow-[0_0_40px_rgba(52,245,208,0.1)] rounded-2xl px-4 py-3 flex items-center gap-3 z-50 glass-strong w-[90%] max-w-2xl"
    >
      <form onSubmit={(e) => { e.preventDefault(); if (!isRunning && activeAgent) executeAgent(); }} className="flex-1 flex items-center gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning || !activeAgent}
          placeholder={activeAgent ? `Tell ${activeAgent.name} what to do...` : "Select an agent first"}
          className="flex-1 bg-transparent text-sm text-jarvis-text placeholder-jarvis-text-muted/50 outline-none disabled:opacity-40"
        />

        <div className="w-px h-6 bg-jarvis-panel-border/50 shrink-0" />

        {hasFinished ? (
          <button
            type="button"
            onClick={resetExecution}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider bg-jarvis-panel-border text-jarvis-text hover:bg-jarvis-panel"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        ) : isRunning ? (
          <button
            type="button"
            onClick={stopExecution}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider bg-[#FF4D4D] text-white hover:bg-[#FF4D4D]/80"
          >
            <Square className="size-3 fill-current" /> Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!activeAgent}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider",
              !activeAgent
                ? "opacity-30 cursor-not-allowed bg-jarvis-panel text-jarvis-text"
                : "bg-[#34F5D0] hover:bg-[#34F5D0]/80 text-jarvis-bg-deepest"
            )}
          >
            <Send className="size-3" /> Run Agent
          </button>
        )}
      </form>

      {executionState.logs.length > 0 && (
        <button
          onClick={() => {
            const logs = executionState.logs.map(l => `[${l.timestamp.toLocaleTimeString()}] ${l.level.toUpperCase()}: ${l.message}`).join("\n");
            const result = executionState.result ? `\n\nOUTPUT:\n${executionState.result}` : "";
            const blob = new Blob([logs + result], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${activeAgent?.name || "agent"}-execution-log.txt`;
            a.click();
          }}
          className="p-2 hover:bg-jarvis-panel/50 rounded-lg transition-colors text-jarvis-text-muted hover:text-jarvis-text"
          title="Download logs"
        >
          <Download className="size-4" />
        </button>
      )}
    </motion.div>
  );
}
