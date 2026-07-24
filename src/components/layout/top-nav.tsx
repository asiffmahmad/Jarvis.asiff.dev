"use client";

/**
 * JARVIS Top Navigation / Command Bar
 *
 * DNA spec: Top Command Bar with JARVIS branding, search trigger,
 * notifications, system status, and user profile access.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Wifi,
  Cpu,
  Command,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";

interface TopNavProps {
  onOpenCommandPalette: () => void;
}

export function TopNav({ onOpenCommandPalette }: TopNavProps) {
  const { sidebarCollapsed } = useTheme();
  const { logout, user } = useAuth();
  const [notifications] = useState(3);

  return (
    <motion.header
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "flex items-center justify-between px-6",
        "bg-jarvis-bg-deepest/80 backdrop-blur-xl",
        "border-b border-jarvis-border"
      )}
      initial={false}
      animate={{ left: sidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Left: Search Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-[12px]",
          "bg-jarvis-panel/40 border border-jarvis-border",
          "text-jarvis-text-muted hover:text-jarvis-text-secondary",
          "hover:border-jarvis-border-strong hover:bg-jarvis-panel/60",
          "transition-all duration-250",
          "min-w-[280px]",
          "cursor-pointer"
        )}
      >
        <Search className="size-4" />
        <span className="text-sm">Search or type a command…</span>
        <kbd className="ml-auto flex items-center gap-1 rounded-[6px] bg-jarvis-bg-base/80 px-2 py-0.5 text-[10px] text-jarvis-text-muted border border-jarvis-border">
          <Command className="size-3" />K
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* System Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-jarvis-panel/30 border border-jarvis-border">
              <Cpu className="size-3.5 text-jarvis-primary animate-glow-pulse" />
              <span className="text-xs text-jarvis-text-muted">AI Active</span>
              <div className="size-1.5 rounded-full bg-jarvis-success shadow-[0_0_6px_rgba(66,255,152,0.6)]" />
            </div>
          </TooltipTrigger>
          <TooltipContent>System Online — All Agents Active</TooltipContent>
        </Tooltip>

        {/* Network Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Wifi className="size-4 text-jarvis-success" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Connected</TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-4" />
              {notifications > 0 && (
                <Badge
                  variant="danger"
                  className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{notifications} new notifications</TooltipContent>
        </Tooltip>

        {/* User Profile */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="cursor-pointer">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs bg-jarvis-accent/15 text-jarvis-accent uppercase">
                  {user?.username?.substring(0, 2) || "JA"}
                </AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
          <TooltipContent>Your Profile</TooltipContent>
        </Tooltip>

        {/* Logout */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => logout()}>
              <LogOut className="size-4 text-jarvis-danger" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Log Out</TooltipContent>
        </Tooltip>
      </div>
    </motion.header>
  );
}
