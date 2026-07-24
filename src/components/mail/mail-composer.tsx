"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { X, Send, Paperclip, Clock, Sparkles, Loader2, ChevronDown } from "lucide-react";
import type { MailState } from "@/lib/mail/use-mail";

interface MailComposerProps {
  mailState: MailState;
  onClose: () => void;
}

export function MailComposer({ mailState, onClose }: MailComposerProps) {
  const { activeThread } = mailState;
  
  // Initial state logic for replies
  const initialTo = activeThread 
    ? activeThread.participants.filter(p => p.email !== "tony@starkindustries.com").map(p => p.email).join(", ")
    : "";
  const initialSubject = activeThread ? (activeThread.subject.startsWith("Re:") ? activeThread.subject : `Re: ${activeThread.subject}`) : "";

  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAiAction = async (action: string, instructions?: string) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setAiMenuOpen(false);
    abortControllerRef.current = new AbortController();

    // If writing a reply from scratch, provide thread context
    // If improving tone, provide the current body draft as context
    const threadContext = action === "improve_tone" 
      ? `Current Draft to rewrite:\n${body}`
      : activeThread 
        ? activeThread.messages.map(m => `From: ${m.from.name}\n${m.bodyPlain}`).join("\n\n")
        : "";

    setBody(""); // Clear for streaming

    try {
      const res = await fetch("/api/mail/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          threadContext,
          instructions
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
              setBody(prev => prev + content);
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setBody(`[ERROR: ${(err as Error).message}]`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute bottom-6 right-6 w-[600px] h-[500px] bg-jarvis-bg-deepest border border-jarvis-panel-border shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-xl z-50 flex flex-col overflow-hidden glass-strong"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-jarvis-panel/50 border-b border-jarvis-panel/50">
        <h3 className="text-sm font-bold text-jarvis-text">New Message</h3>
        <button onClick={onClose} className="text-jarvis-text-muted hover:text-jarvis-text transition-colors">
          <X className="size-4" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col border-b border-jarvis-panel/30 bg-jarvis-bg-deep/50">
        <div className="flex items-center px-4 py-2 border-b border-jarvis-panel/20">
          <span className="text-xs text-jarvis-text-muted w-12 shrink-0">To:</span>
          <input 
            type="text" 
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-jarvis-text" 
          />
        </div>
        <div className="flex items-center px-4 py-2 border-b border-jarvis-panel/20">
          <span className="text-xs text-jarvis-text-muted w-12 shrink-0">Subject:</span>
          <input 
            type="text" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-jarvis-text font-medium" 
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Compose your message..."
          className="size-full bg-transparent resize-none p-4 focus:outline-none text-sm text-jarvis-text leading-relaxed"
        />
        {isGenerating && (
          <div className="absolute inset-0 bg-jarvis-bg-deepest/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 bg-jarvis-panel/80 px-6 py-4 rounded-xl border border-jarvis-primary/30 shadow-lg">
              <Loader2 className="size-6 text-jarvis-primary animate-spin" />
              <span className="text-xs font-bold text-jarvis-primary uppercase tracking-widest text-glow">
                AI Assistant Drafting
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Toolbar */}
      <div className="p-3 bg-jarvis-panel/40 border-t border-jarvis-panel/50 flex items-center justify-between">
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { onClose(); }}
            className="flex items-center gap-2 px-4 py-2 bg-jarvis-primary hover:bg-jarvis-primary/90 text-jarvis-bg-deepest rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <Send className="size-3" /> Send
          </button>
          
          <button className="p-2 text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel/50 rounded-lg transition-colors">
            <Paperclip className="size-4" />
          </button>
          <button className="p-2 text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel/50 rounded-lg transition-colors">
            <Clock className="size-4" />
          </button>
        </div>

        {/* AI Tools */}
        <div className="relative">
          <button 
            onClick={() => setAiMenuOpen(!aiMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-jarvis-accent/10 hover:bg-jarvis-accent/20 text-jarvis-accent border border-jarvis-accent/30 rounded-lg transition-all text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="size-3" /> AI Actions <ChevronDown className="size-3" />
          </button>
          
          {aiMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-jarvis-panel border border-jarvis-panel-border rounded-xl shadow-xl overflow-hidden py-1">
              <button onClick={() => handleAiAction("smart_reply", "Professional and concise.")} className="w-full text-left px-4 py-2 text-xs text-jarvis-text hover:bg-jarvis-primary/20 hover:text-jarvis-primary transition-colors flex items-center justify-between">
                Smart Reply (Professional)
              </button>
              <button onClick={() => handleAiAction("smart_reply", "Friendly and enthusiastic.")} className="w-full text-left px-4 py-2 text-xs text-jarvis-text hover:bg-jarvis-primary/20 hover:text-jarvis-primary transition-colors flex items-center justify-between">
                Smart Reply (Friendly)
              </button>
              <div className="h-px w-full bg-jarvis-panel-border/50 my-1" />
              <button onClick={() => handleAiAction("improve_tone", "more professional")} className="w-full text-left px-4 py-2 text-xs text-jarvis-text hover:bg-jarvis-primary/20 hover:text-jarvis-primary transition-colors flex items-center justify-between">
                Improve Tone
              </button>
              <button onClick={() => handleAiAction("improve_tone", "shorter and punchier")} className="w-full text-left px-4 py-2 text-xs text-jarvis-text hover:bg-jarvis-primary/20 hover:text-jarvis-primary transition-colors flex items-center justify-between">
                Shorten Draft
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
