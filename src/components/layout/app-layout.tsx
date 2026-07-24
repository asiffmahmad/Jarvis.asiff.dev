"use client";

/**
 * JARVIS Application Layout
 *
 * Root layout orchestrating Sidebar + TopNav + Main Workspace.
 * Manages the command palette state and responsive layout adjustments.
 */

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { CommandPalette } from "./command-palette";

interface AppLayoutProps {
  children: React.ReactNode;
  edgeToEdge?: boolean;
}

export function AppLayout({ children, edgeToEdge = false }: AppLayoutProps) {
  const { sidebarCollapsed } = useTheme();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  /* Global ⌘K / Ctrl+K shortcut */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-jarvis-bg-deepest hud-grid">
      <Sidebar />
      <TopNav onOpenCommandPalette={openCommandPalette} />

      <motion.main
        className={cn(
          "pt-16 h-screen flex flex-col",
          "transition-[padding] duration-300"
        )}
        initial={false}
        animate={{ paddingLeft: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {edgeToEdge ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>
        ) : (
          <div className="p-6 overflow-y-auto h-full">
            {children}
          </div>
        )}
      </motion.main>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={closeCommandPalette}
      />
    </div>
  );
}
