"use client";

import { useEffect, useRef } from "react";
import { type Message } from "ai";
import { MessageBubble } from "./message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1 px-4 py-6" viewportRef={scrollRef}>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 mt-20">
          <div className="size-16 rounded-[14px] bg-jarvis-primary/5 border border-jarvis-primary/20 flex items-center justify-center">
            <Bot className="size-8 text-jarvis-primary" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-jarvis-text tracking-widest uppercase">System Online</h3>
            <p className="text-sm text-jarvis-text-muted mt-1 max-w-sm">
              JARVIS AI Workspace initialized. Ready to process commands, generate content, or assist with operations.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              role={message.role as "user" | "assistant" | "system" | "data"}
              isStreaming={isLoading && index === messages.length - 1 && message.role !== "user"}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
