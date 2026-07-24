import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutTemplate, Image as ImageIcon, Wand2, BookOpen, Layers, Loader2, Sparkles } from "lucide-react";

interface Props {
  activeSlideId: string;
  addImageElement: (slideId: string, url: string) => void;
}

export function CarouselSidebarLeft({ activeSlideId, addImageElement }: Props) {
  const [activeTab, setActiveTab] = useState<string>("AI Tools");
  const [prompt, setPrompt] = useState<string>("");
  const [style, setStyle] = useState<string>("Neon Sci-fi");
  const [generating, setGenerating] = useState<boolean>(false);

  const menuItems = [
    { id: "Templates", icon: LayoutTemplate, label: "Templates" },
    { id: "Slide Library", icon: Layers, label: "Slide Library" },
    { id: "Brand Kit", icon: BookOpen, label: "Brand Kit" },
    { id: "Assets", icon: ImageIcon, label: "Assets" },
    { id: "AI Tools", icon: Wand2, label: "AI Tools" },
  ];

  const handleGenerateImage = async () => {
    if (!prompt.trim() || !activeSlideId) return;
    setGenerating(true);
    try {
      // Simulate high quality API request delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const seed = Math.floor(Math.random() * 1000000);
      const stylePrompt = style === "Minimal" 
        ? "clean simple flat illustration style vector graphics on a solid matching background" 
        : style === "Neon Sci-fi" 
        ? "glowing neon sci-fi theme cyberpunk elements, dark dramatic lighting, ultra-detailed 8k" 
        : style === "Cyberpunk" 
        ? "gritty cyberpunk city style, holographic accents, neon lights, retrofuturism" 
        : "sleek professional corporate clean business tech design aesthetic";
        
      const fullPrompt = `${prompt}, ${stylePrompt}`;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=800&height=450&nologo=true&seed=${seed}`;
      
      addImageElement(activeSlideId, url);
      setPrompt("");
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] flex-shrink-0 h-full border-r border-jarvis-panel/50 glass-strong bg-jarvis-panel/20 backdrop-blur-md relative z-20 flex flex-col"
    >
      <div className="p-4 border-b border-jarvis-primary/10">
        <h2 className="font-heading text-sm font-bold tracking-widest text-jarvis-primary uppercase text-glow">
          Assets & tools
        </h2>
      </div>

      <div className="flex border-b border-jarvis-panel/30">
        {menuItems.slice(3).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2
              ${activeTab === item.id 
                ? "text-jarvis-primary border-jarvis-primary bg-jarvis-primary/5" 
                : "text-jarvis-text-muted border-transparent hover:text-jarvis-text"
              }`}
          >
            <item.icon className="size-4 mb-1" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "AI Tools" && (
          <div className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="size-3 text-jarvis-primary" /> Prompt Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full bg-jarvis-panel border border-jarvis-panel-border rounded-lg px-3 py-2.5 text-xs text-jarvis-text outline-none focus:border-jarvis-primary/50 transition-colors h-24 resize-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">
                Art Style
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {["Minimal", "Neon Sci-fi", "Cyberpunk", "Professional"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-3 py-2 rounded-lg border text-[10px] font-bold transition-all text-center
                      ${style === s
                        ? "bg-jarvis-primary/10 border-jarvis-primary text-jarvis-primary"
                        : "bg-jarvis-panel/30 border-jarvis-panel-border text-jarvis-text-muted hover:border-jarvis-text-muted/50"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={generating || !prompt.trim() || !activeSlideId}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border
                ${generating || !prompt.trim() || !activeSlideId
                  ? "bg-jarvis-panel border-jarvis-panel-border text-jarvis-text-muted cursor-not-allowed"
                  : "bg-jarvis-primary/10 border-jarvis-primary/30 text-jarvis-primary hover:bg-jarvis-primary/20"
                }`}
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="size-4" /> Generate AI Image
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "Assets" && (
          <div className="text-center py-8">
            <ImageIcon className="size-8 text-jarvis-text-muted/30 mx-auto mb-2" />
            <p className="text-xs text-jarvis-text-muted/50 font-mono">No uploaded assets yet.</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
