"use client";

/**
 * JARVIS Sidebar Navigation
 *
 * Collapsible sidebar (80px ↔ 260px) with smooth Framer Motion transitions.
 * DNA spec sections: Dashboard, Create Content, Content Library, Media Studio,
 * Templates, AI Agents, Calendar, Analytics, Automation, Accounts, Settings.
 * Bottom: Profile, Credits, System Status.
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PenSquare,
  CalendarDays,
  Share2,
  Settings,
  Bot,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/*  Navigation Data                                                    */
/* ------------------------------------------------------------------ */

const mainNavItems = [
  { id: "mission-control", label: "Mission Control", icon: LayoutDashboard, href: "/" },
  { id: "create", label: "Create Content", icon: PenSquare, href: "/create" },
  { id: "research", label: "Knowledge Hub", icon: BookOpen, href: "/research" },
  { id: "agents", label: "AI Agents", icon: Bot, href: "/agents" },
  { id: "agent-settings", label: "Agent Settings", icon: Sliders, href: "/agents/settings" },
  { id: "scheduler", label: "Schedule", icon: CalendarDays, href: "/scheduler" },
  { id: "platforms", label: "Platforms", icon: Share2, href: "/platforms" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

const bottomNavItems: typeof mainNavItems = [];

/* ------------------------------------------------------------------ */
/*  Sidebar Component                                                  */
/* ------------------------------------------------------------------ */

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const pathname = usePathname();

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen",
        "flex flex-col",
        "bg-jarvis-bg-deep/90 backdrop-blur-xl",
        "border-r border-jarvis-border",
        "transition-shadow duration-300"
      )}
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-jarvis-border">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="size-8 rounded-[8px] bg-jarvis-primary/15 border border-jarvis-primary/30 flex items-center justify-center">
                <span className="text-jarvis-primary font-heading text-xs font-bold">J</span>
              </div>
              <span className="font-heading text-sm font-bold tracking-widest text-jarvis-primary text-glow">
                JARVIS
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {sidebarCollapsed && (
          <div className="mx-auto size-8 rounded-[8px] bg-jarvis-primary/15 border border-jarvis-primary/30 flex items-center justify-center">
            <span className="text-jarvis-primary font-heading text-xs font-bold">J</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="flex flex-col gap-1 px-3">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[12px] px-3 py-2.5",
                  "transition-all duration-250",
                  "relative overflow-hidden",
                  isActive
                    ? "bg-jarvis-primary/10 text-jarvis-primary"
                    : "text-jarvis-text-secondary hover:bg-jarvis-primary/5 hover:text-jarvis-text"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-jarvis-primary shadow-[0_0_8px_rgba(52,245,208,0.6)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-jarvis-primary drop-shadow-[0_0_6px_rgba(52,245,208,0.4)]"
                      : "text-jarvis-text-muted group-hover:text-jarvis-text-secondary"
                  )}
                />

                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-jarvis-border py-3 px-3">
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "rounded-[12px] px-3 py-2",
            "text-jarvis-text-muted hover:text-jarvis-text-secondary",
            "hover:bg-jarvis-primary/5",
            "transition-all duration-250",
            "cursor-pointer"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
