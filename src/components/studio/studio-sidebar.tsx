import { Folder, PenTool, Image as ImageIcon, MessageSquare, History, FileText, Settings, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function StudioSidebar() {
  const navItems = [
    { icon: PenTool, label: "Content Types", active: true },
    { icon: Layers, label: "Brand Kit" },
    { icon: FileText, label: "Templates" },
    { icon: MessageSquare, label: "Prompt Library" },
    { icon: ImageIcon, label: "Media Assets" },
    { icon: History, label: "Recent Drafts" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-[80px] hover:w-[260px] transition-all duration-300 ease-in-out border-r border-jarvis-border/30 bg-jarvis-bg-panel/80 backdrop-blur-xl h-full flex flex-col group relative z-20">
      <div className="p-4 h-16 flex items-center border-b border-jarvis-border/30">
        <div className="w-10 h-10 min-w-[40px] rounded-full bg-jarvis-glow-primary/10 border border-jarvis-glow-primary/30 flex items-center justify-center text-jarvis-glow-primary shadow-[0_0_15px_rgba(52,245,208,0.2)]">
          <Folder size={20} />
        </div>
        <span className="ml-4 font-heading font-bold text-lg text-jarvis-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          STUDIO
        </span>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-2 px-3">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={cn(
                "w-full flex items-center p-3 rounded-xl transition-all duration-300 relative group/btn",
                item.active 
                  ? "bg-jarvis-glow-primary/10 text-jarvis-glow-primary border border-jarvis-glow-primary/30" 
                  : "text-jarvis-text-secondary hover:text-jarvis-text-primary hover:bg-white/5 border border-transparent"
              )}
            >
              {item.active && (
                <div className="absolute inset-0 rounded-xl bg-jarvis-glow-primary/5 shadow-[0_0_15px_rgba(52,245,208,0.1)] pointer-events-none" />
              )}
              <item.icon size={22} className="min-w-[22px]" />
              <span className="ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
