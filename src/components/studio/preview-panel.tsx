import { previewEngine } from "@/lib/studio/preview-engine";
import type { Platform } from "@/lib/studio/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentScorePanel } from "./content-score";

interface PreviewPanelProps {
  platform: Platform;
  content: string;
}

export function PreviewPanel({ platform, content }: PreviewPanelProps) {
  const previewText = previewEngine.generatePreview(content, platform);

  return (
    <div className="w-[380px] bg-jarvis-bg-panel/90 backdrop-blur-xl border-l border-jarvis-border/30 h-full flex flex-col relative z-20">
      <div className="h-16 flex items-center px-6 border-b border-jarvis-border/30">
        <h2 className="font-heading font-bold text-jarvis-text-primary">Live Preview</h2>
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-jarvis-glow-primary/10 text-jarvis-glow-primary border border-jarvis-glow-primary/30 uppercase tracking-wider">
          {platform}
        </span>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="bg-black/40 rounded-2xl border border-jarvis-border/50 overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.3)]">
          {/* Mock Social Header */}
          <div className="flex items-center gap-3 p-4 border-b border-jarvis-border/30">
            <div className="w-10 h-10 rounded-full bg-jarvis-border/50 animate-pulse" />
            <div className="space-y-2">
              <div className="w-24 h-3 rounded bg-jarvis-border/50 animate-pulse" />
              <div className="w-16 h-2 rounded bg-jarvis-border/30 animate-pulse" />
            </div>
          </div>
          
          {/* Post Content */}
          <div className="p-4 text-sm text-jarvis-text-primary whitespace-pre-wrap leading-relaxed">
            {previewText || <span className="text-jarvis-text-muted italic">Draft empty...</span>}
          </div>

          {/* Mock Social Footer */}
          <div className="p-4 border-t border-jarvis-border/30 flex gap-4">
            <div className="w-6 h-6 rounded-full bg-jarvis-border/30 animate-pulse" />
            <div className="w-6 h-6 rounded-full bg-jarvis-border/30 animate-pulse" />
            <div className="w-6 h-6 rounded-full bg-jarvis-border/30 animate-pulse" />
          </div>
        </div>

        <div className="mt-6">
          <ContentScorePanel content={content} platform={platform} />
        </div>
      </ScrollArea>
    </div>
  );
}
