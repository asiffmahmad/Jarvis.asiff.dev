/**
 * JARVIS Content Automation Suite — Type Definitions
 *
 * Shared type definitions used across the application.
 */

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  Dashboard Widgets                                                  */
/* ------------------------------------------------------------------ */

export interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
}

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

export type ContentStatus = "draft" | "scheduled" | "published" | "failed";
export type Platform =
  | "instagram"
  | "linkedin"
  | "threads"
  | "x"
  | "youtube";

export interface ContentPost {
  id: string;
  title: string;
  status: ContentStatus;
  platform: Platform[];
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  System                                                             */
/* ------------------------------------------------------------------ */

export interface SystemStatus {
  cpu: number;
  memory: number;
  uptime: number;
  agentStatus: "active" | "idle" | "error";
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/* ------------------------------------------------------------------ */
/*  Command Palette                                                    */
/* ------------------------------------------------------------------ */

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  category: "navigation" | "action" | "content" | "system";
}
