"use client";

import { useEffect, useState, useRef } from "react";
import { Wand2 } from "lucide-react";
import type { Prompt } from "@/lib/prompts/types";

interface PromptEditorProps {
  prompt: Prompt;
  onUpdate: (updates: Partial<Prompt>) => void;
}

export function PromptEditor({ prompt, onUpdate }: PromptEditorProps) {
  const [content, setContent] = useState(prompt.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if prompt changes externally
  useEffect(() => {
    if (content !== prompt.content) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(prompt.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt.id, prompt.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    onUpdate({ content: val });
  };

  // Basic syntax highlighting overlay
  const renderHighlightedText = () => {
    const parts = content.split(/(\{\{.*?\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        return (
          <span key={i} className="text-jarvis-primary font-bold bg-jarvis-primary/10 rounded px-1">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-jarvis-bg-deepest border border-jarvis-panel-border/30 rounded-xl overflow-hidden shadow-inner relative group">
      
      {/* Fake Editor Header */}
      <div className="h-8 bg-jarvis-panel/30 border-b border-jarvis-panel-border/30 flex items-center px-3 justify-between">
        <span className="text-[10px] text-jarvis-text-muted font-heading uppercase tracking-widest flex items-center gap-2">
          <Wand2 className="size-3 text-jarvis-primary" />
          Prompt Payload
        </span>
        <div className="flex items-center gap-2 text-[10px] text-jarvis-text-muted">
          <span>{content.length} chars</span>
          <span>~{Math.ceil(content.length / 4)} tokens</span>
        </div>
      </div>

      <div className="relative flex-1 p-4 font-mono text-sm overflow-hidden">
        {/* Highlight Layer */}
        <div 
          className="absolute inset-0 p-4 whitespace-pre-wrap break-words pointer-events-none text-transparent z-0 overflow-hidden"
          aria-hidden="true"
        >
          {renderHighlightedText()}
        </div>
        
        {/* Actual Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="Type your prompt here. Use {{variable_name}} to add dynamic fields..."
          className="absolute inset-0 p-4 w-full h-full resize-none bg-transparent text-jarvis-text caret-jarvis-primary outline-none z-10 border-none focus:ring-0 whitespace-pre-wrap break-words"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
