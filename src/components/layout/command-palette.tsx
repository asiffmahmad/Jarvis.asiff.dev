"use client";

/**
 * JARVIS Command Palette
 *
 * Full-screen command palette activated by ⌘K / Ctrl+K.
 * Glassmorphism overlay with fuzzy search across navigation and actions.
 * Keyboard navigation with Framer Motion enter/exit animations.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  PenSquare,
  Library,
  Film,
  Bot,
  CalendarDays,
  BarChart3,
  Workflow,
  Users,
  Settings,
  Zap,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Command Data                                                       */
/* ------------------------------------------------------------------ */

interface CommandEntry {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "navigation" | "action" | "content";
  action: () => void;
}

function useCommands(): CommandEntry[] {
  const router = useRouter();

  return useMemo(
    () => [
      { id: "nav-dashboard", label: "Dashboard", description: "Go to dashboard", icon: LayoutDashboard, category: "navigation" as const, action: () => router.push("/") },
      { id: "nav-create", label: "Create Content", description: "Create a new post", icon: PenSquare, category: "navigation" as const, action: () => router.push("/create") },
      { id: "nav-library", label: "Content Library", description: "Browse content library", icon: Library, category: "navigation" as const, action: () => router.push("/library") },
      { id: "nav-media", label: "Media Studio", description: "Open media studio", icon: Film, category: "navigation" as const, action: () => router.push("/media") },
      { id: "nav-agents", label: "AI Agents", description: "Manage AI agents", icon: Bot, category: "navigation" as const, action: () => router.push("/agents") },
      { id: "nav-calendar", label: "Calendar", description: "View content calendar", icon: CalendarDays, category: "navigation" as const, action: () => router.push("/calendar") },
      { id: "nav-analytics", label: "Analytics", description: "View analytics", icon: BarChart3, category: "navigation" as const, action: () => router.push("/analytics") },
      { id: "nav-automation", label: "Automation", description: "Manage workflows", icon: Workflow, category: "navigation" as const, action: () => router.push("/automation") },
      { id: "nav-accounts", label: "Accounts", description: "Social accounts", icon: Users, category: "navigation" as const, action: () => router.push("/accounts") },
      { id: "nav-settings", label: "Settings", description: "Application settings", icon: Settings, category: "navigation" as const, action: () => router.push("/settings") },
      { id: "action-new-post", label: "New Post", description: "Create a new post quickly", icon: FileText, category: "action" as const, action: () => router.push("/create") },
      { id: "action-generate", label: "AI Generate", description: "Generate content with AI", icon: Zap, category: "action" as const, action: () => router.push("/create") },
    ],
    [router]
  );
}

/* ------------------------------------------------------------------ */
/*  Command Palette Component                                          */
/* ------------------------------------------------------------------ */

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const commands = useCommands();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.description.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandEntry[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  const flatItems = useMemo(() => filtered, [filtered]);

  const executeCommand = useCallback(
    (cmd: CommandEntry) => {
      cmd.action();
      handleClose();
    },
    [handleClose]
  );

  /* Keyboard handler */
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % flatItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
          break;
        case "Enter":
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            executeCommand(flatItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, flatItems, selectedIndex, executeCommand, handleClose]);




  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    action: "Quick Actions",
    content: "Content",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-jarvis-bg-deepest/70 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed top-[20%] left-1/2 -translate-x-1/2 z-50",
              "w-full max-w-[580px]",
              "rounded-[18px] glass-strong overflow-hidden",
              "shadow-[0_0_60px_rgba(52,245,208,0.08)]"
            )}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-jarvis-border">
              <Search className="size-5 text-jarvis-primary shrink-0" />
              <input
                type="text"
                placeholder="Type a command or search…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent text-sm text-jarvis-text placeholder:text-jarvis-text-muted focus:outline-none"
                autoFocus
              />
              <kbd className="rounded-[6px] bg-jarvis-bg-base/80 px-2 py-0.5 text-[10px] text-jarvis-text-muted border border-jarvis-border">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-jarvis-text-muted">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-5 py-2">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-jarvis-text-muted">
                        {categoryLabels[category] ?? category}
                      </span>
                    </div>
                    {items.map((cmd) => {
                      const globalIndex = flatItems.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            "w-full flex items-center gap-3 px-5 py-2.5",
                            "text-left transition-colors duration-150",
                            "cursor-pointer",
                            isSelected
                              ? "bg-jarvis-primary/8 text-jarvis-text"
                              : "text-jarvis-text-secondary hover:bg-jarvis-primary/5"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              isSelected ? "text-jarvis-primary" : "text-jarvis-text-muted"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{cmd.label}</div>
                            <div className="text-xs text-jarvis-text-muted truncate">
                              {cmd.description}
                            </div>
                          </div>
                          {isSelected && (
                            <kbd className="rounded-[4px] bg-jarvis-bg-base/80 px-1.5 py-0.5 text-[10px] text-jarvis-text-muted border border-jarvis-border">
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-jarvis-border text-[10px] text-jarvis-text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded-[3px] bg-jarvis-bg-base/80 px-1 py-0.5 border border-jarvis-border">↑</kbd>
                  <kbd className="rounded-[3px] bg-jarvis-bg-base/80 px-1 py-0.5 border border-jarvis-border">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded-[3px] bg-jarvis-bg-base/80 px-1 py-0.5 border border-jarvis-border">↵</kbd>
                  select
                </span>
              </div>
              <span>{filtered.length} results</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
