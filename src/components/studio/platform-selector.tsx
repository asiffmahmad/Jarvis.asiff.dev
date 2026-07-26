"use client";

import { Camera, Briefcase, MessageSquare, Video, Users, Music, MessageCircle, Pin } from "lucide-react";
import type { Platform } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

interface PlatformSelectorProps {
  activePlatform: Platform;
  onChange: (p: Platform) => void;
}

export function PlatformSelector({ activePlatform, onChange }: PlatformSelectorProps) {
  const platforms: { id: Platform; icon: React.ElementType; label: string }[] = [
    { id: "linkedin", icon: Briefcase, label: "LinkedIn" },
    { id: "x", icon: MessageSquare, label: "X (Twitter)" },
    { id: "instagram", icon: Camera, label: "Instagram" },
    { id: "facebook", icon: Users, label: "Facebook" },
    { id: "youtube", icon: Video, label: "YouTube" },
    { id: "tiktok", icon: Music, label: "TikTok" },
    { id: "threads", icon: MessageCircle, label: "Threads" },
    { id: "pinterest", icon: Pin, label: "Pinterest" },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-jarvis-border/50 rounded-xl backdrop-blur-md">
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          title={p.label}
          className={cn(
            "p-2 rounded-lg transition-all relative flex items-center justify-center",
            activePlatform === p.id
              ? "text-jarvis-glow-primary bg-jarvis-glow-primary/10 shadow-[0_0_15px_rgba(52,245,208,0.2)]"
              : "text-jarvis-text-secondary hover:text-jarvis-text-primary hover:bg-white/5"
          )}
        >
          <p.icon size={18} />
        </button>
      ))}
    </div>
  );
}
