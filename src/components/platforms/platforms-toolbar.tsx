"use client";

import { motion } from "framer-motion";
import { Link2, Unlink, RefreshCw, Loader2 } from "lucide-react";
import type { PlatformsState } from "@/lib/platforms/use-platforms";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  state: PlatformsState;
}

export function PlatformsToolbar({ state }: ToolbarProps) {
  const { activeProvider, activeAccount, connectPlatform, disconnectAccount, syncAccount, isConnecting, isSyncing } = state;

  const isProviderReady = activeProvider?.isAvailable;
  
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-jarvis-panel border border-jarvis-panel-border shadow-[0_0_40px_rgba(52,245,208,0.1)] rounded-full px-4 py-2 flex items-center gap-2 z-50 glass-strong"
    >
      <button 
        onClick={() => {
          if (activeProvider && isProviderReady) {
            connectPlatform(activeProvider.id);
          }
        }}
        disabled={!isProviderReady || isConnecting}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider",
          !isProviderReady ? "opacity-30 cursor-not-allowed bg-jarvis-panel border border-transparent text-jarvis-text" :
          isConnecting
            ? "bg-[#34F5D0] text-jarvis-bg-deepest"
            : "bg-[#34F5D0] hover:bg-[#34F5D0]/80 text-jarvis-bg-deepest"
        )}
      >
        {isConnecting ? <Loader2 className="size-3 animate-spin" /> : <Link2 className="size-3" />}
        {isConnecting ? "Authenticating..." : "Connect Account"}
      </button>

      <div className="w-px h-6 bg-jarvis-panel-border/50 mx-2" />
      
      <ToolButton 
        icon={RefreshCw} 
        label="Sync connection" 
        onClick={() => activeAccount && syncAccount(activeAccount.id)}
        disabled={!activeAccount || isSyncing} 
        active={isSyncing}
      />
      <ToolButton 
        icon={Unlink} 
        label="Disconnect" 
        onClick={() => activeAccount && disconnectAccount(activeAccount.id)}
        disabled={!activeAccount || isSyncing} 
      />

    </motion.div>
  );
}

function ToolButton({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled,
  active
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick?: () => void; 
  disabled?: boolean; 
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors text-xs font-bold uppercase tracking-widest border border-transparent",
        disabled
          ? "opacity-30 cursor-not-allowed text-jarvis-text-muted"
          : "hover:bg-jarvis-panel/50 hover:border-jarvis-panel-border text-jarvis-text"
      )}
    >
      <Icon className={cn("size-3", active && "animate-spin text-[#34F5D0]")} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
