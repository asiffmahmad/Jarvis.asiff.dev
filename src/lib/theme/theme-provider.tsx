"use client";

/**
 * JARVIS Content Automation Suite — Theme Provider
 *
 * Global theme context providing design system state to all components.
 * The JARVIS interface is always dark by design — this provider manages
 * theme state and injects CSS custom properties into the document root.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createLogger } from "@/lib/logger";

const log = createLogger("ThemeProvider");

type ThemeMode = "dark" | "system";

interface ThemeContextValue {
  /** Current active theme mode */
  mode: ThemeMode;
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Toggle sidebar collapse state */
  toggleSidebar: () => void;
  /** Set sidebar collapse state explicitly */
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme mode. JARVIS is designed as a dark interface. */
  defaultMode?: ThemeMode;
  /** Default sidebar state */
  defaultSidebarCollapsed?: boolean;
}

export function ThemeProvider({
  children,
  defaultMode = "dark",
  defaultSidebarCollapsed = false,
}: ThemeProviderProps) {
  const [mode] = useState<ThemeMode>(defaultMode);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    defaultSidebarCollapsed
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      log.debug("Sidebar toggled", { collapsed: !prev });
      return !prev;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.setAttribute("data-theme", "jarvis");
    log.info("Theme initialized", { mode });
  }, [mode]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        sidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Access the JARVIS theme context.
 *
 * @example
 * const { sidebarCollapsed, toggleSidebar } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
