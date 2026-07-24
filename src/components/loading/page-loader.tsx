/**
 * JARVIS Page Loader
 *
 * Full-page loading screen with animated JARVIS branding
 * and pulsing progress indicator.
 */

"use client";

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-jarvis-bg-deepest">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] rounded-full bg-jarvis-primary/5 blur-[100px]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="size-20 rounded-[18px] bg-jarvis-primary/10 border border-jarvis-primary/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,245,208,0.15)]">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="font-heading text-2xl font-bold text-jarvis-primary text-glow"
          >
            J
          </motion.span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="font-heading text-lg font-bold tracking-[0.3em] text-jarvis-primary text-glow mb-8"
        >
          JARVIS
        </motion.h1>

        {/* Progress bar */}
        <div className="w-48 h-0.5 rounded-full bg-jarvis-panel overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-jarvis-primary via-jarvis-secondary to-jarvis-primary rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-4 text-xs text-jarvis-text-muted tracking-wider uppercase"
        >
          Initializing Systems…
        </motion.p>
      </motion.div>
    </div>
  );
}
