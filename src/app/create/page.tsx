"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PenSquare, Send, Calendar, Hash, Target, Copy, Check,
  X, ArrowLeft, Eye, Edit3, ThumbsUp, Loader2, Sparkles,
  MessageCircle, Heart, Bookmark, ChevronDown, Globe, FileText, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getGeneratedPost, clearGeneratedPost, getPendingGeneration, clearPendingGeneration, storeGeneratedPost } from "@/lib/cross-page-store";
import type { PostData, PendingGeneration } from "@/lib/cross-page-store";
import type { GeneratedPost } from "@/lib/publishing/types";
import { AppLayout } from "@/components/layout/app-layout";
import { OAuthService } from "@/lib/platforms/oauth-service";
import type { ConnectedAccount } from "@/lib/platforms/types";

const platformConfig: Record<string, { name: string; color: string; bg: string }> = {
  linkedin: { name: "LinkedIn", color: "#0A66C2", bg: "bg-[#0A66C2]/10" },
  instagram: { name: "Instagram", color: "#E1306C", bg: "bg-[#E1306C]/10" },
  x: { name: "X", color: "#fff", bg: "bg-white/5" },
};

function Repeat(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function AccountAvatar({ account, size = "md" }: { account: ConnectedAccount; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "w-6 h-6 text-[9px]", md: "w-10 h-10 text-xs", lg: "w-12 h-12 text-sm" };
  const initials = account.accountName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={cn("rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-jarvis-primary to-jarvis-accent flex items-center justify-center font-bold text-white", sizeClasses[size])}>
      {account.avatarUrl ? (
        <img src={account.avatarUrl} alt={account.accountName} className="w-full h-full object-cover" />
      ) : initials}
    </div>
  );
}

function PlatformPreview({ post, account }: { post: PostData; account: ConnectedAccount | null }) {
  const cfg = platformConfig[post.platform] || platformConfig.linkedin;
  const displayName = account?.accountName || "Account";
  const handle = account?.handle || "@account";

  if (post.platform === "linkedin") {
    return (
      <div className="bg-white rounded-xl overflow-hidden max-w-lg mx-auto shadow-lg border border-gray-200">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            {account ? (
              <AccountAvatar account={account} size="lg" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-bold text-sm">?</div>
            )}
            <div>
              <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
              <p className="text-xs text-gray-500">{handle} · 1h ago</p>
            </div>
            <div className="ml-auto">
              <span className="text-[#0A66C2] font-bold text-sm">in</span>
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base">{post.title}</p>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
          </div>
          {post.hashtags.length > 0 && (
            <p className="text-sm text-[#0A66C2]">{post.hashtags.map(h => `#${h}`).join(" ")}</p>
          )}
          <div className="pt-2 border-t border-gray-200 flex items-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><ThumbsUp className="size-3.5" /> 0</span>
            <span className="flex items-center gap-1.5"><MessageCircle className="size-3.5" /> 0</span>
            <span className="flex items-center gap-1.5"><Repeat className="size-3.5" /> 0</span>
            <span className="flex items-center gap-1.5 ml-auto"><Send className="size-3.5" /></span>
          </div>
        </div>
      </div>
    );
  }

  if (post.platform === "instagram") {
    return (
      <div className="bg-white rounded-xl overflow-hidden max-w-sm mx-auto shadow-lg border border-gray-200">
        <div className="p-3 flex items-center gap-3">
          {account ? (
            <AccountAvatar account={account} size="sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-900">?</div>
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900">{handle.replace("@", "")}</span>
          <span className="ml-auto text-gray-600">•••</span>
        </div>
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm">
          <Target className="size-8" />
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-3">
            <Heart className="size-5 text-gray-900" />
            <MessageCircle className="size-5 text-gray-900" />
            <Send className="size-5 text-gray-900" />
            <Bookmark className="size-5 text-gray-900 ml-auto" />
          </div>
          <p className="text-sm font-semibold text-gray-900">0 likes</p>
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{handle.replace("@", "")}</span> {post.caption.slice(0, 125)}{post.caption.length > 125 ? "..." : ""}
          </p>
          {post.hashtags.length > 0 && (
            <p className="text-sm text-[#00376B]">{post.hashtags.map(h => `#${h}`).join(" ")}</p>
          )}
        </div>
      </div>
    );
  }

  if (post.platform === "x") {
    return (
      <div className="bg-black rounded-xl overflow-hidden max-w-lg mx-auto shadow-lg border border-gray-800">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            {account ? (
              <AccountAvatar account={account} size="md" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold text-sm">?</div>
            )}
            <div>
              <p className="font-semibold text-white text-sm">{displayName} <span className="font-normal text-gray-500">{handle} · 1h</span></p>
            </div>
            <span className="ml-auto text-gray-500 text-sm font-bold">𝕏</span>
          </div>
          <p className="text-[15px] text-white leading-relaxed whitespace-pre-wrap">{post.caption}</p>
          {post.hashtags.length > 0 && (
            <p className="text-sm text-[#1d9bf0]">{post.hashtags.map(h => `#${h}`).join(" ")}</p>
          )}
          <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-gray-500 text-sm">
            <span className="flex items-center gap-2"><MessageCircle className="size-4" /> 0</span>
            <span className="flex items-center gap-2"><Repeat className="size-4" /> 0</span>
            <span className="flex items-center gap-2"><Heart className="size-4" /> 0</span>
            <span className="flex items-center gap-2"><Bookmark className="size-4" /></span>
            <span className="flex items-center gap-2"><Send className="size-4" /></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden max-w-lg mx-auto shadow-lg border border-gray-200">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: cfg.color }}>
            {displayName[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
            <p className="text-xs text-gray-500">{handle} · on {cfg.name}</p>
          </div>
        </div>
        <p className="font-bold text-gray-900 text-base">{post.title}</p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
        {post.hashtags.length > 0 && (
          <p className="text-sm" style={{ color: cfg.color }}>{post.hashtags.map(h => `#${h}`).join(" ")}</p>
        )}
      </div>
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter();
  interface DraftItem {
    id: string;
    status: string;
    title: string;
    updatedAt: string;
    post: PostData | null;
    pendingGen: PendingGeneration | null;
  }
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const activeDraft = useMemo(() => drafts.find(d => d.id === selectedDraftId) || null, [drafts, selectedDraftId]);
  const post = activeDraft?.post || null;
  const pendingGen = activeDraft?.pendingGen || null;
  const abortRef = useRef<AbortController | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const oauthService = useMemo(() => OAuthService.getInstance(), []);
  const allAccounts = useMemo(() => oauthService.getAccounts(), [oauthService]);

  const accountsForPlatform = useMemo(() => {
    if (!post) return [];
    return allAccounts.filter(a => a.platformId === post.platform);
  }, [allAccounts, post]);

  const selectedAccount = useMemo(() => {
    if (!selectedAccountId) return accountsForPlatform[0] || null;
    return allAccounts.find(a => a.id === selectedAccountId) || null;
  }, [allAccounts, selectedAccountId, accountsForPlatform]);

  const updateActivePost = (updatedPost: PostData) => {
    setDrafts(prev => prev.map(d => d.id === selectedDraftId ? { ...d, post: updatedPost } : d));
  };

  const refreshDrafts = useCallback(async (selectId?: string) => {
    try {
      const res = await fetch("/api/publish/draft");
      if (res.ok) {
        const result = await res.json();
        const items = result.drafts || [];
        setDrafts(items);
        if (selectId && items.some((d: any) => d.id === selectId)) {
          setSelectedDraftId(selectId);
          const active = items.find((d: any) => d.id === selectId);
          if (active && active.post) {
            setEditCaption(active.post.caption);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch drafts:", err);
    }
  }, []);

  const saveDraftToDb = async (draftData: PostData, id?: string) => {
    const targetId = id || selectedDraftId || undefined;
    try {
      await fetch("/api/publish/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: draftData, contentId: targetId }),
      });
      const res = await fetch("/api/publish/draft");
      if (res.ok) {
        const result = await res.json();
        setDrafts(result.drafts || []);
      }
    } catch (err) {
      console.error("Failed to save draft to MySQL:", err);
    }
  };

  const deleteDraftFromDb = async (id?: string) => {
    const targetId = id || selectedDraftId;
    if (!targetId) return;
    try {
      await fetch(`/api/publish/draft?id=${targetId}`, {
        method: "DELETE",
      });
      setDrafts(prev => prev.filter(d => d.id !== targetId));
      setSelectedDraftId(null);
    } catch (err) {
      console.error("Failed to delete draft from MySQL:", err);
    }
  };

  useEffect(() => {
    refreshDrafts();
  }, [allAccounts]);

  useEffect(() => {
    if (post?.platform) {
      const matching = allAccounts.filter(a => a.platformId === post.platform);
      if (matching.length > 0) {
        setSelectedAccountId(matching[0].id);
      } else {
        setSelectedAccountId(null);
      }
    }
  }, [post?.platform, allAccounts]);

  // Kick off async generation when pendingGen is set
  useEffect(() => {
    if (!pendingGen || !selectedDraftId) return;
    setGenerating(true);
    setGenerationError(null);
    abortRef.current = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/publish/generate", {
          signal: abortRef.current?.signal,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingGen),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Generation failed" }));
          throw new Error(err.error || "Generation failed");
        }

        const result = await res.json();
        const postData: PostData = {
          title: result.title || "",
          caption: result.caption || "",
          hashtags: Array.isArray(result.hashtags) ? result.hashtags : [],
          mediaIdeas: Array.isArray(result.mediaIdeas) ? result.mediaIdeas : [],
          callToAction: result.callToAction || "",
          platform: result.platform || pendingGen.platform,
          bestPostingTime: result.bestPostingTime || "",
          topic: pendingGen.topic,
          tone: pendingGen.tone,
          contentType: pendingGen.contentType,
        };

        // Save the newly generated post to MySQL draft database!
        await fetch("/api/publish/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post: postData, contentId: selectedDraftId }),
        });

        setGenerating(false);
        await refreshDrafts(selectedDraftId);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setGenerationError((err as Error).message);
          setGenerating(false);
        }
      }
    })();

    return () => {
      abortRef.current?.abort();
    };
  }, [pendingGen, selectedDraftId]);

  const cfg = post ? platformConfig[post.platform] || platformConfig.linkedin : null;

  const handlePlatformChange = (newPlatform: string) => {
    if (!post) return;
    const updated = { ...post, platform: newPlatform };
    updateActivePost(updated);
    saveDraftToDb(updated);
    const matching = allAccounts.filter(a => a.platformId === newPlatform);
    setSelectedAccountId(matching.length > 0 ? matching[0].id : null);
  };

  const handleAccept = async () => {
    if (!post || !selectedAccount) return;
    setStatusMsg("Posting...");
    try {
      const res = await fetch("/api/publish/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post: { ...post, id: `post_${Date.now()}`, contentType: "post", tone: "professional", characterCount: post.caption.length, createdAt: new Date().toISOString() },
          platform: post.platform,
          scheduleFor: new Date(Date.now() + 10000).toISOString(),
          accountId: selectedAccount.id,
        }),
      });
      if (!res.ok) throw new Error();
      setStatusMsg("Posted! It will appear on your connected account shortly.");
      clearGeneratedPost();
      await deleteDraftFromDb();
      setTimeout(() => router.push("/scheduler"), 2000);
    } catch {
      setStatusMsg("Post failed. Check your platform connection.");
    }
  };

  const handleSchedule = async () => {
    if (!post || !selectedAccount) return;
    setStatusMsg("Scheduling...");
    try {
      const res = await fetch("/api/publish/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post: { ...post, id: `post_${Date.now()}`, contentType: "post", tone: "professional", characterCount: post.caption.length, createdAt: new Date().toISOString() },
          platform: post.platform,
          scheduleFor: new Date(scheduleDate).toISOString(),
          accountId: selectedAccount.id,
        }),
      });
      if (!res.ok) throw new Error();
      setStatusMsg(`Scheduled for ${new Date(scheduleDate).toLocaleString()}`);
      setShowSchedule(false);
      clearGeneratedPost();
      await deleteDraftFromDb();
      setTimeout(() => router.push("/scheduler"), 2000);
    } catch {
      setStatusMsg("Scheduling failed.");
    }
  };

  const copyCaption = async () => {
    if (!post) return;
    await navigator.clipboard.writeText(post.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!post || !feedbackText.trim()) return;
    setShowFeedback(false);
    setGenerating(true);
    setGenerationError(null);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/publish/regenerate", {
        signal: abortRef.current?.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: post.topic || post.title,
          platform: post.platform,
          tone: post.tone || "professional",
          contentType: post.contentType || "post",
          existingPost: {
            title: post.title,
            caption: post.caption,
            hashtags: post.hashtags,
          },
          feedback: feedbackText.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Regeneration failed" }));
        throw new Error(err.error || "Regeneration failed");
      }

      const result: GeneratedPost = await res.json();
      const postData: PostData = {
        title: result.title || "",
        caption: result.caption || "",
        hashtags: Array.isArray(result.hashtags) ? result.hashtags : [],
        mediaIdeas: Array.isArray(result.mediaIdeas) ? result.mediaIdeas : [],
        callToAction: result.callToAction || "",
        platform: result.platform || post.platform,
        bestPostingTime: result.bestPostingTime || "",
        topic: post.topic || post.title,
        tone: post.tone || "professional",
        contentType: post.contentType || "post",
      };
      updateActivePost(postData);
      setEditCaption(postData.caption);
      await saveDraftToDb(postData);
      setGenerating(false);
      setFeedbackText("");

      const matching = allAccounts.filter(a => a.platformId === postData.platform);
      if (matching.length > 0) {
        setSelectedAccountId(matching[0].id);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setGenerationError((err as Error).message);
        setGenerating(false);
      }
    }
  };

  if (!selectedDraftId && !generating && !generationError) {
    if (drafts.length === 0) {
      return (
        <AppLayout>
          <div className="h-full w-full overflow-y-auto bg-jarvis-bg p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <PenSquare className="size-6 text-jarvis-primary" />
                <h1 className="text-2xl font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow">
                  Create Content
                </h1>
              </div>
              <div className="glass-panel p-12 text-center">
                <PenSquare className="size-12 text-jarvis-text-muted/30 mx-auto mb-4" />
                <p className="text-jarvis-text-muted">No posts to review.</p>
                <p className="text-xs font-mono text-jarvis-text-muted/50 mt-2">
                  Generate a post in Agents or Research first.
                </p>
                <button
                  onClick={() => router.push("/agents")}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-jarvis-primary/10 border border-jarvis-primary/30 text-jarvis-primary text-xs font-bold uppercase tracking-wider hover:bg-jarvis-primary/20 transition-colors"
                >
                  Go to Agents
                </button>
              </div>
            </div>
          </div>
        </AppLayout>
      );
    }

    return (
      <AppLayout>
        <div className="h-full w-full overflow-y-auto bg-jarvis-bg p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PenSquare className="size-6 text-jarvis-primary" />
                <h1 className="text-2xl font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow">
                  Review Drafts
                </h1>
                <span className="text-xs bg-jarvis-primary/20 text-jarvis-primary px-2.5 py-1 rounded-full font-bold">
                  {drafts.length} total
                </span>
              </div>
              <button
                onClick={() => router.push("/agents")}
                className="px-4 py-2 rounded-xl bg-jarvis-primary/10 border border-jarvis-primary/30 text-jarvis-primary text-xs font-bold uppercase tracking-wider hover:bg-jarvis-primary/20 transition-all"
              >
                + New Draft
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map(d => (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDraftId(d.id);
                    if (d.post) setEditCaption(d.post.caption);
                  }}
                  className="glass-panel p-5 hover:border-jarvis-primary/50 transition-all cursor-pointer flex flex-col justify-between h-48 group hover:-translate-y-1 duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-jarvis-panel border border-jarvis-panel-border/30 text-jarvis-text-muted">
                        {d.status === "pending_generation" ? "loading" : (d.post?.platform || "post")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-jarvis-text-muted/60 font-mono">
                          {new Date(d.updatedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this draft?")) {
                              await deleteDraftFromDb(d.id);
                            }
                          }}
                          className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete Draft"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-jarvis-text group-hover:text-jarvis-primary transition-colors line-clamp-2">
                      {d.title}
                    </h3>
                    {d.post && (
                      <p className="text-xs text-jarvis-text-muted line-clamp-3 leading-relaxed mt-1">
                        {d.post.caption}
                      </p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-jarvis-panel-border/30 flex items-center justify-between mt-auto">
                    <span className="text-[9px] text-jarvis-text-muted/50 font-mono">
                      Click to review
                    </span>
                    <ArrowLeft className="size-3.5 text-jarvis-text-muted group-hover:text-jarvis-primary group-hover:translate-x-1 transition-all rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show generation progress while AI is working
  if (generating || pendingGen) {
    const gen = pendingGen;
    return (
      <AppLayout>
        <div className="h-full w-full overflow-y-auto bg-jarvis-bg p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <PenSquare className="size-6 text-jarvis-primary" />
              <h1 className="text-2xl font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow">
                Create Content
              </h1>
            </div>
            <div className="glass-panel p-12 text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-jarvis-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-jarvis-primary border-transparent animate-spin" />
                <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-jarvis-primary/10 to-jarvis-accent/10 flex items-center justify-center">
                  <Sparkles className="size-8 text-jarvis-primary" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-jarvis-text">Generating Your Post</p>
                <p className="text-xs font-mono text-jarvis-text-muted/70 mt-1">
                  AI is crafting content optimized for your platform
                </p>
              </div>
              {gen && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-jarvis-primary/10 border border-jarvis-primary/20 text-jarvis-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="size-3" /> {platformConfig[gen.platform]?.name || gen.platform}
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-jarvis-accent/10 border border-jarvis-accent/20 text-jarvis-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="size-3" /> {gen.tone}
                  </span>
                </div>
              )}
              <div className="w-48 h-1.5 bg-jarvis-panel/30 rounded-full mx-auto overflow-hidden border border-jarvis-panel-border/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-jarvis-primary to-jarvis-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
                />
              </div>
              <p className="text-[10px] font-mono text-jarvis-text-muted/40">
                This usually takes 15-30 seconds
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (generationError && !post) {
    return (
      <AppLayout>
        <div className="h-full w-full overflow-y-auto bg-jarvis-bg p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <PenSquare className="size-6 text-jarvis-primary" />
              <h1 className="text-2xl font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow">
                Create Content
              </h1>
            </div>
            <div className="glass-panel p-12 text-center border-[#FF4D4D]/30">
              <div className="w-16 h-16 rounded-full bg-[#FF4D4D]/10 flex items-center justify-center mx-auto mb-4">
                <X className="size-8 text-[#FF4D4D]" />
              </div>
              <p className="text-lg font-bold text-[#FF4D4D]">Generation Failed</p>
              <p className="text-xs font-mono text-jarvis-text-muted mt-2">{generationError}</p>
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => router.push("/agents")}
                  className="px-5 py-2.5 rounded-xl border border-jarvis-panel-border text-xs font-bold uppercase tracking-wider text-jarvis-text-muted hover:text-jarvis-text transition-colors"
                >
                  Back to Agents
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!post) return null;

  return (
    <AppLayout>
      <div className="h-full w-full overflow-y-auto bg-jarvis-bg p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedDraftId(null)} className="p-2 hover:bg-jarvis-panel rounded-lg transition-colors text-jarvis-text-muted flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <ArrowLeft className="size-4" /> Back to Drafts
              </button>
              <span className="text-jarvis-text-muted/30">|</span>
              <PenSquare className="size-6 text-jarvis-primary" />
              <h1 className="text-2xl font-heading font-bold uppercase tracking-widest text-jarvis-primary text-glow">
                Review Post
              </h1>
            </div>
            {statusMsg && (
              <span className="text-xs font-mono text-[#34F5D0] bg-[#34F5D0]/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Loader2 className="size-3 animate-spin" /> {statusMsg}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-jarvis-text-muted" />
                <h2 className="text-xs font-heading font-bold text-jarvis-text uppercase tracking-widest">Platform Preview</h2>
                {cfg && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                    {cfg.name}
                  </span>
                )}
              </div>
              <PlatformPreview post={post} account={selectedAccount} />
            </div>

            {/* Post Details & Actions */}
            <div className="space-y-4">
              <div className="glass-panel p-5 space-y-4">
                {/* Platform selector */}
                <div>
                  <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Platform</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(platformConfig).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => handlePlatformChange(key)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border",
                          post.platform === key
                            ? "border-jarvis-primary/40 text-jarvis-primary bg-jarvis-primary/10"
                            : "border-jarvis-panel-border text-jarvis-text-muted hover:text-jarvis-text"
                        )}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account selector */}
                {accountsForPlatform.length > 0 && (
                  <div className="relative">
                    <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Posting as</span>
                    <button
                      onClick={() => setShowAccountPicker(!showAccountPicker)}
                      className="w-full mt-1 flex items-center gap-3 bg-jarvis-panel border border-jarvis-panel-border rounded-lg px-3 py-2.5 text-sm text-jarvis-text hover:border-jarvis-primary/30 transition-colors"
                    >
                      {selectedAccount && <AccountAvatar account={selectedAccount} size="sm" />}
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-jarvis-text">{selectedAccount?.accountName || "Select account"}</p>
                        <p className="text-xs text-jarvis-text-muted">{selectedAccount?.handle || ""}</p>
                      </div>
                      <ChevronDown className="size-4 text-jarvis-text-muted" />
                    </button>
                    {showAccountPicker && (
                      <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-jarvis-bg-deep border border-jarvis-panel-border rounded-xl overflow-hidden shadow-xl">
                        {accountsForPlatform.map(acc => (
                          <button
                            key={acc.id}
                            onClick={() => { setSelectedAccountId(acc.id); setShowAccountPicker(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-jarvis-text hover:bg-jarvis-panel transition-colors",
                              selectedAccountId === acc.id && "bg-jarvis-primary/5"
                            )}
                          >
                            <AccountAvatar account={acc} size="sm" />
                            <div className="text-left">
                              <p className="text-sm font-semibold">{acc.accountName}</p>
                              <p className="text-xs text-jarvis-text-muted">{acc.handle}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <div>
                  <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Title</span>
                  <p className="text-base font-bold text-jarvis-text mt-1">{post.title}</p>
                </div>

                {/* Caption */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Caption</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditing(!editing)} className="text-[10px] text-jarvis-text-muted hover:text-jarvis-primary transition-colors flex items-center gap-1">
                        <Edit3 className="size-3" /> {editing ? "Done" : "Edit"}
                      </button>
                      <button onClick={copyCaption} className="text-[10px] text-jarvis-text-muted hover:text-jarvis-primary transition-colors flex items-center gap-1">
                        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  {editing ? (
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full mt-1 bg-jarvis-panel border border-jarvis-panel-border rounded-lg px-3 py-2 text-sm text-jarvis-text outline-none focus:border-jarvis-primary/50 transition-colors resize-none h-40 font-mono"
                    />
                  ) : (
                    <p className="text-sm text-jarvis-text/80 mt-1 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
                  )}
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] font-mono text-jarvis-text-muted">{post.caption.length} chars</span>
                    {editing && (
                      <button
                        onClick={() => {
                          const updated = { ...post, caption: editCaption };
                          updateActivePost(updated);
                          saveDraftToDb(updated);
                          setEditing(false);
                        }}
                        className="text-[10px] text-jarvis-primary hover:text-jarvis-primary/80 font-bold uppercase tracking-wider"
                      >
                        Update
                      </button>
                    )}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1">
                    <Hash className="size-3" /> Hashtags
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {post.hashtags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded bg-jarvis-primary/5 border border-jarvis-primary/20 text-[11px] text-jarvis-primary font-mono">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Media Ideas */}
                <div>
                  <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest flex items-center gap-1">
                    <Target className="size-3" /> Media Ideas
                  </span>
                  <ul className="mt-1.5 space-y-1">
                    {post.mediaIdeas.map((idea, i) => (
                      <li key={i} className="text-sm text-jarvis-text/70 flex items-start gap-2">
                        <span className="text-jarvis-primary mt-1">▸</span>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                {post.callToAction && (
                  <div className="pt-2 border-t border-jarvis-panel-border/50">
                    <span className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest">Call to Action</span>
                    <p className="text-sm text-jarvis-text/80 mt-0.5">{post.callToAction}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  disabled={!selectedAccount}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex-1 justify-center",
                    selectedAccount
                      ? "bg-[#34F5D0] hover:bg-[#34F5D0]/80 text-jarvis-bg-deepest"
                      : "bg-jarvis-panel text-jarvis-text-muted cursor-not-allowed"
                  )}
                >
                  <ThumbsUp className="size-4" /> Accept & Post
                </button>
                <button
                  onClick={() => setShowSchedule(true)}
                  disabled={!selectedAccount}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex-1 justify-center",
                    selectedAccount
                      ? "bg-jarvis-accent/10 border border-jarvis-accent/30 text-jarvis-accent hover:bg-jarvis-accent/20"
                      : "bg-jarvis-panel border border-jarvis-panel-border text-jarvis-text-muted cursor-not-allowed"
                  )}
                >
                  <Calendar className="size-4" /> Schedule
                </button>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider border border-jarvis-accent/30 text-jarvis-accent hover:bg-jarvis-accent/10"
                >
                  <Repeat className="size-4" /> Revise
                </button>
                <button
                  onClick={async () => {
                    clearGeneratedPost();
                    await deleteDraftFromDb();
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider border border-jarvis-panel-border text-jarvis-text-muted hover:text-jarvis-text"
                >
                  <X className="size-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account picker backdrop */}
      {showAccountPicker && (
        <div className="fixed inset-0 z-0" onClick={() => setShowAccountPicker(false)} />
      )}

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowSchedule(false)}>
          <div className="bg-jarvis-bg-deep border border-jarvis-panel-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
                <Calendar className="size-4 text-jarvis-accent" /> Schedule Post
              </h3>
              <button onClick={() => setShowSchedule(false)} className="p-1 hover:bg-jarvis-panel rounded-lg transition-colors text-jarvis-text-muted">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest block mb-1.5">Account</label>
                <div className="bg-jarvis-panel border border-jarvis-panel-border rounded-lg px-4 py-2.5 text-sm text-jarvis-text font-semibold">{selectedAccount?.accountName || post.platform}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest block mb-1.5">Schedule Date & Time</label>
                <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full bg-jarvis-panel border border-jarvis-panel-border rounded-lg px-4 py-2.5 text-sm text-jarvis-text outline-none focus:border-jarvis-accent/50 transition-colors" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSchedule(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-jarvis-panel-border text-xs font-bold uppercase tracking-wider text-jarvis-text-muted hover:text-jarvis-text transition-colors">Cancel</button>
                <button onClick={handleSchedule} className="flex-1 px-4 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider bg-jarvis-accent hover:bg-jarvis-accent/80 text-white">Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback modal for revise */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowFeedback(false)}>
          <div className="bg-jarvis-bg-deep border border-jarvis-panel-border rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
                <Repeat className="size-4 text-jarvis-accent" /> Send Back to Agent
              </h3>
              <button onClick={() => { setShowFeedback(false); setFeedbackText(""); }} className="p-1 hover:bg-jarvis-panel rounded-lg transition-colors text-jarvis-text-muted">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-jarvis-text-muted uppercase tracking-widest block mb-1.5">What needs to change?</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell the agent what you'd like different..."
                  className="w-full bg-jarvis-panel border border-jarvis-panel-border rounded-xl px-4 py-3 text-sm text-jarvis-text placeholder-jarvis-text-muted/50 outline-none resize-none h-32 focus:border-jarvis-accent/50 transition-colors font-mono"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowFeedback(false); setFeedbackText(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-jarvis-panel-border text-xs font-bold uppercase tracking-wider text-jarvis-text-muted hover:text-jarvis-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={!feedbackText.trim()}
                  className={cn(
                    "flex-1 px-4 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider",
                    feedbackText.trim()
                      ? "bg-jarvis-accent hover:bg-jarvis-accent/80 text-white"
                      : "bg-jarvis-panel text-jarvis-text-muted cursor-not-allowed"
                  )}
                >
                  <Repeat className="size-3.5 inline mr-1.5" /> Revise Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
