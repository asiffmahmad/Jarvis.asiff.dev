import { GitCommit, Clock, ArrowRight } from "lucide-react";
import type { ContentVersion } from "@/lib/studio/types";

interface VersionTimelineProps {
  versions: ContentVersion[];
  onRestore: (versionId: string) => void;
}

export function VersionTimeline({ versions, onRestore }: VersionTimelineProps) {
  if (versions.length === 0) {
    return (
      <div className="p-8 text-center text-jarvis-text-muted">
        <Clock className="mx-auto mb-3 opacity-50" size={24} />
        <p>No version history available.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-6">
      <div className="absolute left-[23px] top-4 bottom-4 w-px bg-jarvis-border/50" />
      
      {versions.map((v) => (
        <div key={v.id} className="relative flex gap-4">
          <div className="relative mt-1">
            <div className="w-5 h-5 rounded-full bg-jarvis-bg-panel border-2 border-jarvis-glow-primary/50 flex items-center justify-center shadow-[0_0_10px_rgba(52,245,208,0.2)] z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-jarvis-glow-primary" />
            </div>
          </div>
          
          <div className="flex-1 bg-black/30 border border-jarvis-border/30 rounded-xl p-4 hover:border-jarvis-glow-primary/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-semibold text-jarvis-text-primary text-sm flex items-center gap-2">
                <GitCommit size={14} className="text-jarvis-glow-primary" />
                {v.author}
              </span>
              <span className="text-xs text-jarvis-text-muted font-mono">
                {new Date(v.createdAt).toLocaleTimeString()}
              </span>
            </div>
            
            <p className="text-sm text-jarvis-text-secondary mb-3">
              {v.commitMessage || "Autosaved draft"}
            </p>
            
            <button 
              onClick={() => onRestore(v.id)}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-xs font-semibold text-jarvis-glow-primary uppercase tracking-wider transition-opacity hover:text-white"
            >
              Restore Version
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
