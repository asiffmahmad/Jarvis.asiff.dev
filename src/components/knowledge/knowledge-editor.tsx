"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Edit3, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { KnowledgeState } from "@/lib/knowledge/use-knowledge";
import { cn } from "@/lib/utils";

interface EditorProps {
  state: KnowledgeState;
}

export function KnowledgeEditor({ state }: EditorProps) {
  const { activeItem, setActiveItemId, saveItem } = state;
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (activeItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(activeItem.title);
      setContent(activeItem.content);
      setIsDirty(false);
    }
  }, [activeItem]);

  if (!activeItem) return null;

  const handleSave = () => {
    saveItem({ ...activeItem, title, content });
    setIsDirty(false);
  };

  const handleClose = () => {
    if (isDirty) handleSave();
    setActiveItemId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-[2.5] flex flex-col relative h-full bg-jarvis-bg-deep border-l border-jarvis-panel/50 z-30 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
    >
      {/* Toolbar */}
      <div className="h-14 border-b border-jarvis-panel/30 flex items-center justify-between px-4 shrink-0 bg-jarvis-panel/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
            placeholder="Untitled Document"
            className="bg-transparent border-none text-jarvis-text font-bold text-lg focus:outline-none placeholder:text-jarvis-text-muted/50 w-[300px]"
          />
          {isDirty && <span className="text-[10px] text-jarvis-primary uppercase font-mono tracking-widest">Unsaved</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-jarvis-panel/30 hover:bg-jarvis-panel/50 text-xs font-medium text-jarvis-text transition-colors border border-jarvis-panel-border/30"
          >
            {isPreview ? <Edit3 className="size-3" /> : <Eye className="size-3" />}
            {isPreview ? "Edit" : "Preview"}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={!isDirty}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors border",
              isDirty ? "bg-jarvis-primary/20 text-jarvis-primary border-jarvis-primary/50 hover:bg-jarvis-primary hover:text-jarvis-bg-deepest" : "bg-jarvis-panel/30 text-jarvis-text-muted border-transparent cursor-not-allowed"
            )}
          >
            <Save className="size-3" /> Save
          </button>
          
          <div className="w-px h-4 bg-jarvis-panel-border/50 mx-1" />
          
          <button onClick={handleClose} className="p-1.5 text-jarvis-text-muted hover:text-jarvis-text transition-colors rounded hover:bg-jarvis-panel/50">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Raw Markdown */}
        {!isPreview && (
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
            placeholder="Start typing in Markdown..."
            className="flex-1 h-full w-full bg-transparent resize-none p-6 text-sm text-jarvis-text focus:outline-none leading-relaxed font-mono selection:bg-jarvis-primary/30"
          />
        )}

        {/* Right: Preview */}
        {(isPreview || activeItem.type === "DOCUMENT") && (
          <div className={cn(
            "h-full overflow-y-auto p-8",
            isPreview ? "flex-1" : "w-1/2 border-l border-jarvis-panel/30 bg-jarvis-bg-deepest/30"
          )}>
            <div className="prose prose-invert prose-jarvis max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

    </motion.div>
  );
}
