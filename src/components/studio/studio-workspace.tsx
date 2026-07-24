import { PlatformSelector } from "./platform-selector";
import { RichEditor } from "./rich-editor";
import { StudioToolbar } from "./studio-toolbar";
import type { Platform } from "@/lib/studio/types";

interface StudioWorkspaceProps {
  platform: Platform;
  setPlatform: (p: Platform) => void;
  content: string;
  setContent: (content: string) => void;
}

export function StudioWorkspace({ platform, setPlatform, content, setContent }: StudioWorkspaceProps) {
  return (
    <div className="flex-1 flex flex-col relative z-10 h-full p-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Content Studio
          </h1>
          <p className="text-jarvis-text-secondary text-sm">
            AI-powered drafting and publishing environment
          </p>
        </div>
        
        <PlatformSelector activePlatform={platform} onChange={setPlatform} />
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-0 relative">
        <RichEditor content={content} onChange={setContent} />
      </div>

      {/* Floating Toolbar */}
      <StudioToolbar />
    </div>
  );
}
