"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant" | "system" | "data";
  isStreaming?: boolean;
}

export const MessageBubble = memo(function MessageBubble({ content, role, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={cn("flex gap-4 mb-6 w-full group", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {isUser ? (
          <Avatar className="size-8">
            <AvatarFallback className="text-xs bg-jarvis-panel border border-jarvis-border text-jarvis-text-muted">
              OP
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-8 rounded-full bg-jarvis-primary/10 border border-jarvis-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(52,245,208,0.2)]">
            <span className="font-heading text-xs font-bold text-jarvis-primary text-glow">
              J
            </span>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[85%] rounded-[12px] p-4",
          isUser
            ? "bg-jarvis-panel/40 border border-jarvis-border"
            : "bg-transparent border-none pr-8"
        )}
      >
        <div className={cn("prose prose-invert max-w-none", isUser ? "text-jarvis-text" : "text-jarvis-text-secondary")}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";
                
                if (!inline && match) {
                  return (
                    <div className="relative my-4 rounded-[8px] overflow-hidden border border-jarvis-border/50 bg-[#1d1f21]">
                      <div className="flex items-center justify-between px-4 py-2 bg-jarvis-bg-deepest border-b border-jarvis-border/50">
                        <div className="flex items-center gap-2">
                          <Terminal className="size-3 text-jarvis-text-muted" />
                          <span className="text-xs font-mono text-jarvis-text-muted uppercase tracking-wider">{language}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(String(children).replace(/\n$/, ""))}
                          className="text-jarvis-text-muted hover:text-jarvis-text transition-colors"
                          title="Copy Code"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                      <div className="p-4 text-sm font-mono overflow-x-auto">
                        <SyntaxHighlighter
                          {...props}
                          style={atomDark}
                          language={language}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: 0, background: "transparent" }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <code className={cn("bg-jarvis-panel/50 text-jarvis-primary px-1.5 py-0.5 rounded-[4px] font-mono text-[0.85em]", className)} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
          
          {/* Streaming Cursor */}
          {!isUser && isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 align-middle bg-jarvis-primary animate-pulse shadow-[0_0_8px_rgba(52,245,208,0.8)]" />
          )}
        </div>
      </div>
    </div>
  );
});
