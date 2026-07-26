"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createLogger } from "@/lib/logger";
import { SettingsService } from "@/lib/settings/settings-service";

const log = createLogger("ThemeProvider");

type ThemeMode = "dark" | "light" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultSidebarCollapsed?: boolean;
}

export function ThemeProvider({
  children,
  defaultSidebarCollapsed = false,
}: ThemeProviderProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [mode, setMode] = useState<ThemeMode>("dark");

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    // Read directly from SettingsService as useSettings hook might cause unnecessary re-renders here if we just want to watch it, 
    // but ideally we just poll or subscribe. Since this is a simple local storage based service, we can poll or use an event.
    // For simplicity, let's sync every 500ms for this demo since SettingsService doesn't have an EventEmitter.
    
    const root = document.documentElement;
    const service = SettingsService.getInstance();
    
    const syncTheme = () => {
      const settings = service.getSettings();
      const currentTheme = settings.appearance.theme;
      const currentAccent = settings.appearance.accentColor;

      setMode(currentTheme);

      // Apply theme mode
      if (currentTheme === "light" || (currentTheme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        root.classList.add("light");
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
        root.classList.remove("light");
      }

      // Apply accent color overrides
      root.style.setProperty("--color-jarvis-primary", currentAccent);
      root.style.setProperty("--color-jarvis-glow-primary", currentAccent);
    };

    // Initial sync
    syncTheme();

    // Poll to catch updates from the settings page
    const interval = setInterval(syncTheme, 500);

    return () => clearInterval(interval);
  }, []);

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

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
