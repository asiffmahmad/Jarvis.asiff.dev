import { Plus, Copy, Trash2, Undo2, Redo2, Wand2, Play } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  addSlide: () => void;
  removeActiveSlide: () => void;
}

export function CarouselToolbar({ addSlide, removeActiveSlide }: Props) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-strong border border-jarvis-panel/50 rounded-full px-6 py-3 flex items-center gap-4 bg-jarvis-panel/40 backdrop-blur-xl shadow-[0_0_30px_rgba(52,245,208,0.05)]"
    >
      <button
        onClick={addSlide}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-jarvis-primary hover:bg-jarvis-primary/10 transition-colors"
      >
        <Plus className="size-4" />
        <span className="text-sm font-semibold tracking-wide">Add Slide</span>
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border" />

      <button className="p-2 rounded-full text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel transition-colors">
        <Copy className="size-4" />
      </button>
      
      <button 
        onClick={removeActiveSlide}
        className="p-2 rounded-full text-jarvis-text-muted hover:text-jarvis-danger hover:bg-jarvis-danger/10 transition-colors"
      >
        <Trash2 className="size-4" />
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border" />

      <button className="p-2 rounded-full text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel transition-colors">
        <Undo2 className="size-4" />
      </button>
      <button className="p-2 rounded-full text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel transition-colors">
        <Redo2 className="size-4" />
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border" />

      <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-jarvis-accent/10 text-jarvis-accent hover:bg-jarvis-accent/20 border border-jarvis-accent/20 transition-all hover:drop-shadow-[0_0_10px_rgba(138,92,255,0.4)]">
        <Wand2 className="size-4" />
        <span className="text-sm font-semibold tracking-wide">AI Generate</span>
      </button>

      <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-jarvis-primary text-black hover:bg-jarvis-primary/90 transition-all hover:drop-shadow-[0_0_15px_rgba(52,245,208,0.5)]">
        <Play className="size-4" />
        <span className="text-sm font-semibold tracking-wide">Preview</span>
      </button>
    </motion.div>
  );
}
