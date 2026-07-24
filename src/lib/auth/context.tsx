"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

export interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initSession() {
      try {
        const res = await apiClient.get<{ user: User }>("/api/auth/session");
        if (res.ok && res.data.user) {
          setUser(res.data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const login = async (credentials: { username: string; password: string; rememberMe?: boolean }) => {
    const res = await apiClient.post<{ user: User }>("/api/auth/login", credentials);
    if (res.ok && res.data.user) {
      setUser(res.data.user);
      router.push("/");
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
