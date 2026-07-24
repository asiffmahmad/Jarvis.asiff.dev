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
  Library,
  Mail,
  Calendar,
  CalendarDays,
  Globe,
  Database,
  Workflow,
  Film,
  Bot,
  Share2,
  Network,
  Layout,
  BarChart3,
  Users,
  Settings,
  User,
  Coins,
  Activity,
  ChevronLeft,
  ChevronRight,
  TerminalSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Navigation Data                                                    */
/* ------------------------------------------------------------------ */

const mainNavItems = [
  { id: "mission-control", label: "Mission Control", icon: LayoutDashboard, href: "/" },
  { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { id: "create", label: "Create Content", icon: PenSquare, href: "/create" },
  { id: "calendar", label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { id: "mail", label: "AI Mail", icon: Mail, href: "/mail" },
  { id: "research", label: "Research", icon: Globe, href: "/research" },
  { id: "knowledge", label: "Knowledge Hub", icon: Database, href: "/knowledge" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
  { id: "automation", label: "Automation Builder", icon: Workflow, href: "/automation" },
  { id: "agents", label: "AI Agents", icon: Bot, href: "/agents" },
  { id: "scheduler", label: "Scheduler", icon: Calendar, href: "/scheduler" },
  { id: "platforms", label: "Platform Manager", icon: Share2, href: "/platforms" },
  { id: "integrations", label: "Integration Hub", icon: Network, href: "/integrations" },
  { id: "library", label: "Content Library", icon: Library, href: "/library" },
  { id: "media", label: "Media Studio", icon: Film, href: "/media" },
  { id: "prompts", label: "Prompt Library", icon: TerminalSquare, href: "/prompts" },
  { id: "templates", label: "Templates", icon: Layout, href: "/templates" },
  { id: "accounts", label: "Accounts", icon: Users, href: "/accounts" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

const bottomNavItems = [
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
  { id: "credits", label: "Credits", icon: Coins, href: "/credits" },
  { id: "status", label: "System Status", icon: Activity, href: "/status" },
];

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
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-3">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <Link
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
                {/* Active indicator */}
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

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.id}>{linkContent}</div>;
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="border-t border-jarvis-border py-3 px-3">
        <nav className="flex flex-col gap-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[12px] px-3 py-2",
                  "transition-all duration-250",
                  isActive
                    ? "bg-jarvis-primary/10 text-jarvis-primary"
                    : "text-jarvis-text-muted hover:bg-jarvis-primary/5 hover:text-jarvis-text-secondary"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.id}>{linkContent}</div>;
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "mt-3 w-full flex items-center justify-center gap-2",
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
