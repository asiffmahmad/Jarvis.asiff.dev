import { motion } from "framer-motion";
import { LayoutTemplate, Image as ImageIcon, Wand2, BookOpen, Layers } from "lucide-react";

export function CarouselSidebarLeft() {
  const menuItems = [
    { icon: LayoutTemplate, label: "Templates" },
    { icon: Layers, label: "Slide Library" },
    { icon: BookOpen, label: "Brand Kit" },
    { icon: ImageIcon, label: "Assets" },
    { icon: Wand2, label: "AI Tools" },
  ];

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading text-sm font-bold tracking-widest text-jarvis-primary uppercase text-glow">
          Assets
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-jarvis-text-muted hover:text-jarvis-primary hover:bg-jarvis-primary/10 hover:border-jarvis-primary/30 border border-transparent transition-all duration-300 text-left group"
          >
            <item.icon className="size-4 shrink-0 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(52,245,208,0.8)]" />
            <span className="text-sm font-medium tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
    </motion.aside>
  );
}
