"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { useEventStream } from "@/lib/events/use-events";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

export function DashboardConsole() {
  const events = useEventStream();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Note: events are unshifted in the bus, so they are newest first.
  // We'll reverse them here so they scroll downwards like a terminal.
  const displayEvents = [...events].reverse();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayEvents.length]);

  return (
    <motion.div
      initial={{ y: 200 }}
      animate={{ y: 0 }}
      className="absolute bottom-0 left-[260px] right-[300px] h-[180px] bg-jarvis-bg-deepest/90 backdrop-blur-xl border-t border-jarvis-panel/50 flex flex-col z-30"
    >
      <div className="h-8 border-b border-jarvis-panel/30 flex items-center px-4 shrink-0">
        <h2 className="text-[10px] font-mono font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-2">
          <Terminal className="size-3 text-jarvis-primary" /> Live Event Stream
        </h2>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-1 font-mono text-xs">
          {displayEvents.map(event => (
            <div key={event.id} className="flex gap-3 hover:bg-jarvis-panel/30 px-2 py-0.5 rounded">
              <span className="text-jarvis-text-muted shrink-0">
                [{event.timestamp.toISOString().split('T')[1].slice(0, -1)}]
              </span>
              <span className="text-[#F5A623] shrink-0 w-32">
                [{event.source}]
              </span>
              <span className="text-jarvis-text truncate">
                {event.message}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </motion.div>
  );
}
