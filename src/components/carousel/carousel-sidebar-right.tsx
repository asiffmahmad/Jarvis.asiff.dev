import { motion } from "framer-motion";
import { SlidersHorizontal, Type, Palette, Settings } from "lucide-react";

export function CarouselSidebarRight() {
  const tabs = [
    { icon: SlidersHorizontal, label: "Properties" },
    { icon: Type, label: "Typography" },
    { icon: Palette, label: "Theme" },
    { icon: Settings, label: "Export" },
  ];

  return (
    <motion.aside
      initial={{ x: 260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-l border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading text-sm font-bold tracking-widest text-jarvis-secondary uppercase text-glow">
          Inspector
        </h2>
      </div>

      <div className="flex border-b border-jarvis-panel/30">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className="flex-1 flex justify-center items-center py-3 text-jarvis-text-muted hover:text-jarvis-secondary transition-colors"
            title={tab.label}
          >
            <tab.icon className="size-4" />
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Placeholder settings panel */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-jarvis-text-muted tracking-wider uppercase">
            Slide Background
          </label>
          <div className="flex gap-2">
            <div className="w-full h-8 rounded bg-jarvis-panel border border-jarvis-panel-border cursor-pointer hover:border-jarvis-secondary/50 transition-colors"></div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-jarvis-text-muted tracking-wider uppercase">
            Slide Elements
          </label>
          <div className="text-sm text-jarvis-text-muted/50 p-4 border border-dashed border-jarvis-panel-border rounded-lg text-center">
            Select an element to edit properties
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
