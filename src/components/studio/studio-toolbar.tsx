"use client";

import { Save, Eye, Sparkles, Send, History } from "lucide-react";

export function StudioToolbar() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 rounded-2xl bg-jarvis-bg-panel/90 backdrop-blur-xl border border-jarvis-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-30">
      <button
        onClick={() => null}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-jarvis-text-secondary hover:text-jarvis-text-primary hover:bg-white/5 transition-all"
      >
        <Save size={18} />
        <span className="font-medium text-sm">Save Draft</span>
      </button>

      <div className="w-[1px] h-6 bg-jarvis-border/50" />

      <button
        onClick={() => null}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-jarvis-text-secondary hover:text-jarvis-text-primary hover:bg-white/5 transition-all"
      >
        <History size={18} />
        <span className="font-medium text-sm">History</span>
      </button>

      <button
        onClick={() => null}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-jarvis-text-secondary hover:text-jarvis-text-primary hover:bg-white/5 transition-all"
      >
        <Eye size={18} />
        <span className="font-medium text-sm">Preview</span>
      </button>

      <div className="w-[1px] h-6 bg-jarvis-border/50" />

      <button
        onClick={() => null}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-jarvis-glow-secondary bg-jarvis-glow-secondary/10 hover:bg-jarvis-glow-secondary/20 border border-jarvis-glow-secondary/30 transition-all"
      >
        <Sparkles size={18} />
        <span className="font-medium text-sm">Generate</span>
      </button>

      <button
        onClick={() => null}
        className="flex items-center gap-2 px-6 py-2 rounded-xl text-black bg-jarvis-glow-primary hover:bg-jarvis-glow-primary/90 hover:shadow-[0_0_20px_rgba(52,245,208,0.4)] transition-all ml-2 font-bold"
      >
        <Send size={18} />
        <span className="text-sm">Publish</span>
      </button>
    </div>
  );
}
