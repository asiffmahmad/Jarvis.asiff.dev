import { UploadCloud, FolderPlus, Trash2, Download, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

export function MediaToolbar() {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 glass-strong border border-jarvis-panel/50 rounded-full px-6 py-3 flex items-center gap-4 bg-jarvis-panel/40 backdrop-blur-xl shadow-[0_0_30px_rgba(52,245,208,0.05)]"
    >
      <button
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-jarvis-primary text-black hover:bg-jarvis-primary/90 transition-all hover:drop-shadow-[0_0_15px_rgba(52,245,208,0.5)]"
        onClick={() => {
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (input) input.click();
        }}
      >
        <UploadCloud className="size-4" />
        <span className="text-sm font-semibold tracking-wide">Upload</span>
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border" />

      <button className="flex items-center gap-2 p-2 rounded-full text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel transition-colors" title="New Folder">
        <FolderPlus className="size-4" />
      </button>

      <button className="flex items-center gap-2 p-2 rounded-full text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel transition-colors" title="Select All">
        <CheckSquare className="size-4" />
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border" />

      <button className="p-2 rounded-full text-jarvis-text-muted hover:text-jarvis-text hover:bg-jarvis-panel transition-colors" title="Download Selected">
        <Download className="size-4" />
      </button>
      
      <button className="p-2 rounded-full text-jarvis-text-muted hover:text-jarvis-danger hover:bg-jarvis-danger/10 transition-colors" title="Delete Selected">
        <Trash2 className="size-4" />
      </button>
    </motion.div>
  );
}
