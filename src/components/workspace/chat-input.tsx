"use client";

import { type FormEvent, useRef, useEffect } from "react";
import { Send, Square, Paperclip, Mic, Image as ImageIcon } from "lucide-react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading, stop }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <div className="p-4 bg-transparent">
      <div className="max-w-4xl mx-auto relative">
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col bg-jarvis-panel/60 border border-jarvis-border rounded-[16px] overflow-hidden backdrop-blur-xl transition-all focus-within:border-jarvis-primary/50 focus-within:shadow-[0_0_20px_rgba(52,245,208,0.1)]"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="Initialize command sequence..."
            className="w-full bg-transparent text-jarvis-text placeholder:text-jarvis-text-muted/50 p-4 min-h-[56px] max-h-[200px] resize-none outline-none font-mono text-sm leading-relaxed"
            rows={1}
          />
          
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 text-jarvis-text-muted hover:text-jarvis-text transition-colors rounded-[8px] hover:bg-jarvis-bg-deepest" title="Attach File (Coming Soon)">
                <Paperclip className="size-4" />
              </button>
              <button type="button" className="p-2 text-jarvis-text-muted hover:text-jarvis-text transition-colors rounded-[8px] hover:bg-jarvis-bg-deepest" title="Upload Image (Coming Soon)">
                <ImageIcon className="size-4" />
              </button>
              <button type="button" className="p-2 text-jarvis-text-muted hover:text-jarvis-text transition-colors rounded-[8px] hover:bg-jarvis-bg-deepest" title="Voice Input (Coming Soon)">
                <Mic className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-jarvis-text-muted/50 font-mono hidden sm:inline-block mr-2 uppercase tracking-widest">
                Return to send
              </span>
              
              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  className="flex items-center justify-center size-9 rounded-[10px] bg-jarvis-danger/20 text-jarvis-danger hover:bg-jarvis-danger/30 transition-colors border border-jarvis-danger/50"
                  title="Stop generating"
                >
                  <Square className="size-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex items-center justify-center size-9 rounded-[10px] bg-jarvis-primary text-jarvis-bg-deepest hover:bg-jarvis-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(52,245,208,0.3)] hover:shadow-[0_0_20px_rgba(52,245,208,0.5)]"
                  title="Send message"
                >
                  <Send className="size-4 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
