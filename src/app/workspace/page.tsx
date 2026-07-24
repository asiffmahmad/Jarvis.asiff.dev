"use client";

import { useChat } from "ai/react";
import { WorkspaceSidebar } from "@/components/workspace/sidebar";
import { WorkspaceContextPanel } from "@/components/workspace/context-panel";
import { MessageList } from "@/components/workspace/message-list";
import { ChatInput } from "@/components/workspace/chat-input";

export default function WorkspacePage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat",
    initialMessages: [],
  });

  return (
    <>
      <WorkspaceSidebar />
      
      <div className="flex-1 flex flex-col h-full relative">
        <MessageList messages={messages} isLoading={isLoading} />
        
        <div className="mt-auto w-full">
          {/* Subtle gradient separator */}
          <div className="h-24 bg-gradient-to-t from-jarvis-bg-deepest to-transparent absolute bottom-[90px] w-full pointer-events-none" />
          
          <ChatInput 
            input={input} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            isLoading={isLoading} 
            stop={stop}
          />
        </div>
      </div>
      
      <WorkspaceContextPanel />
    </>
  );
}
