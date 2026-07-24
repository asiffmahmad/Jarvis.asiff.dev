"use client";

/**
 * JARVIS 404 — Not Found
 *
 * Styled 404 page with JARVIS aesthetic and navigation assistance.
 */

import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-jarvis-bg-deepest hud-grid p-8">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-jarvis-accent/3 blur-[120px]" />

      <div className="relative z-10 max-w-md w-full text-center">
        {/* 404 Display */}
        <div className="mb-8">
          <span className="font-heading text-8xl font-extrabold tracking-wider text-jarvis-panel-elevated select-none">
            404
          </span>
          <div className="relative -mt-14">
            <span className="font-heading text-6xl font-bold tracking-wider text-jarvis-primary text-glow">
              404
            </span>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-jarvis-text mb-3">
          Sector Not Found
        </h1>
        <p className="text-sm text-jarvis-text-muted mb-8 max-w-sm mx-auto">
          The requested module does not exist in the JARVIS system. It may have been relocated or decommissioned.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" asChild>
            <Link href="/">
              <Home className="size-4" />
              Return to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Search className="size-4" />
              Search System
            </Link>
          </Button>
        </div>

        {/* Decorative scan line */}
        <div className="mt-12 mx-auto w-48 h-px bg-gradient-to-r from-transparent via-jarvis-primary/30 to-transparent" />
      </div>
    </div>
  );
}
