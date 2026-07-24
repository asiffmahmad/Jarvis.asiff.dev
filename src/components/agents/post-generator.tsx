"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles, Send, Hash, Target, Globe, FileText,
} from "lucide-react";
import type { Platform, ContentTone, ContentType } from "@/lib/publishing/types";
import { cn } from "@/lib/utils";

const platforms: { id: Platform; label: string }[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "x", label: "X (Twitter)" },
  { id: "facebook", label: "Facebook" },
  { id: "threads", label: "Threads" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
];

const tones: { id: ContentTone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "inspirational", label: "Inspirational" },
  { id: "educational", label: "Educational" },
  { id: "humorous", label: "Humorous" },
];

const contentTypes: { id: ContentType; label: string }[] = [
  { id: "post", label: "Single Post" },
  { id: "thread", label: "Thread" },
  { id: "carousel", label: "Carousel" },
];

export function PostGenerator() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [tone, setTone] = useState<ContentTone>("professional");
  const [contentType, setContentType] = useState<ContentType>("post");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    try {
      await fetch("/api/publish/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendingGen: {
            topic: topic.trim(),
            platform,
            tone,
            contentType,
          }
        }),
      });
    } catch (err) {
      console.error("Failed to save pending generation config to MySQL:", err);
    }
    router.push("/create");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6">
      <div className="space-y-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-4 text-jarvis-primary" />
          <h2 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest">
            Content Post Generator
          </h2>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to post about? (e.g., 'Our new AI feature launch', 'Q3 market insights')"
              className="w-full bg-jarvis-panel border border-jarvis-panel-border rounded-xl px-4 py-3 text-sm text-jarvis-text placeholder-jarvis-text-muted/50 outline-none resize-none h-20 focus:border-jarvis-primary/50 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!topic.trim()}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider self-end",
              !topic.trim()
                ? "opacity-30 cursor-not-allowed bg-jarvis-panel text-jarvis-text"
                : "bg-[#34F5D0] hover:bg-[#34F5D0]/80 text-jarvis-bg-deepest"
            )}
          >
            <Send className="size-4" />
            Generate
          </button>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="size-3" /> Platform
            </label>
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border",
                    platform === p.id
                      ? "bg-jarvis-primary/10 border-jarvis-primary/40 text-jarvis-primary"
                      : "bg-jarvis-panel/50 border-jarvis-panel-border text-jarvis-text-muted hover:text-jarvis-text hover:border-jarvis-panel-border"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <Hash className="size-3" /> Tone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border",
                    tone === t.id
                      ? "bg-jarvis-accent/10 border-jarvis-accent/40 text-jarvis-accent"
                      : "bg-jarvis-panel/50 border-jarvis-panel-border text-jarvis-text-muted hover:text-jarvis-text hover:border-jarvis-panel-border"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="size-3" /> Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {contentTypes.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => setContentType(ct.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border",
                    contentType === ct.id
                      ? "bg-jarvis-success/10 border-jarvis-success/40 text-jarvis-success"
                      : "bg-jarvis-panel/50 border-jarvis-panel-border text-jarvis-text-muted hover:text-jarvis-text hover:border-jarvis-panel-border"
                  )}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-jarvis-text-muted opacity-50">
        <Sparkles className="size-12 mb-3" />
        <p className="text-xs font-mono uppercase tracking-widest text-center">
          Enter a topic above to generate a complete, platform-optimized post
        </p>
        <p className="text-[10px] font-mono text-jarvis-text-muted/50 mt-2">
          You&apos;ll see real-time progress on the Create page
        </p>
      </div>
    </div>
  );
}
