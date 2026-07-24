"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();
  // callbackUrl can be used for redirection in future iterations
  searchParams.get("callbackUrl");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ username, password });
      // Router handles the redirect in the auth context, or we can use the callbackUrl in future iterations.
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
      {/* JARVIS Logo / Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center mb-10"
      >
        <div className="size-16 rounded-[14px] bg-jarvis-primary/10 border border-jarvis-primary/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(52,245,208,0.15)]">
          <span className="font-heading text-2xl font-bold text-jarvis-primary text-glow">
            J
          </span>
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-[0.2em] text-jarvis-text text-glow uppercase">
          Authentication
        </h1>
        <p className="mt-2 text-sm text-jarvis-text-muted">
          Identify yourself to access the system
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full"
      >
        <Card className="glass-strong border-jarvis-panel p-8 relative overflow-hidden">
          {/* Subtle corner glow inside the card */}
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-jarvis-primary/10 blur-[40px]" />

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 rounded-[8px] bg-jarvis-danger/10 border border-jarvis-danger/20 flex items-start gap-2.5"
                >
                  <AlertCircle className="size-4 text-jarvis-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-jarvis-danger/90">{error}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-xs font-medium text-jarvis-text-muted uppercase tracking-wider"
                  >
                    Operator ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="size-4 text-jarvis-text-muted" />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your ID"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-9 h-11"
                      disabled={isSubmitting}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-jarvis-text-muted uppercase tracking-wider"
                  >
                    Passcode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-4 text-jarvis-text-muted" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-11 font-mono tracking-widest"
                      disabled={isSubmitting}
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 mt-2 text-sm tracking-wider uppercase font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Initialize Session"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
