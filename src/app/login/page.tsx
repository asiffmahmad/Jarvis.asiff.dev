"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

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

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-jarvis-border/40"></div>
                <span className="flex-shrink mx-4 text-xs text-jarvis-text-muted uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-jarvis-border/40"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-jarvis-border hover:bg-jarvis-primary/5 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <svg className="size-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Authorize Google Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
