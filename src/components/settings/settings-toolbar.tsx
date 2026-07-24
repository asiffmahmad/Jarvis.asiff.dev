"use client";

import { motion } from "framer-motion";
import { Save, RotateCcw, Download, ShieldAlert, Loader2 } from "lucide-react";
import type { SettingsState } from "@/lib/settings/use-settings";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  state: SettingsState;
}

export function SettingsToolbar({ state }: ToolbarProps) {
  const { isDirty, isSaving, saveSettings, resetSettings, restoreDefaults, exportSettings } = state;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-jarvis-panel border border-jarvis-panel-border shadow-[0_0_40px_rgba(52,245,208,0.1)] rounded-full px-4 py-2 flex items-center gap-2 z-50 glass-strong"
    >
      <button 
        onClick={saveSettings}
        disabled={!isDirty || isSaving}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider",
          !isDirty ? "opacity-30 cursor-not-allowed bg-jarvis-panel border border-transparent text-jarvis-text" :
          isSaving
            ? "bg-[#34F5D0] text-jarvis-bg-deepest"
            : "bg-[#34F5D0] hover:bg-[#34F5D0]/80 text-jarvis-bg-deepest"
        )}
      >
        {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
        {isSaving ? "Saving..." : "Apply Changes"}
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />
      
      <ToolButton 
        icon={RotateCcw} 
        label="Discard" 
        onClick={resetSettings}
        disabled={!isDirty || isSaving} 
      />
      <ToolButton 
        icon={Download} 
        label="Export JSON" 
        onClick={exportSettings}
      />
      <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />
      <ToolButton 
        icon={ShieldAlert} 
        label="Restore Defaults" 
        onClick={restoreDefaults}
        danger
      />

    </motion.div>
  );
}

function ToolButton({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled,
  danger
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick?: () => void; 
  disabled?: boolean; 
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors text-xs font-bold uppercase tracking-widest border border-transparent",
        disabled
          ? "opacity-30 cursor-not-allowed text-jarvis-text-muted"
          : danger
            ? "hover:bg-[#FF4D4D]/20 hover:text-[#FF4D4D] text-jarvis-text"
            : "hover:bg-jarvis-panel/50 hover:border-jarvis-panel-border text-jarvis-text"
      )}
    >
      <Icon className="size-3" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
