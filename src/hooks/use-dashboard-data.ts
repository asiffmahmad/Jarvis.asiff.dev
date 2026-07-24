"use client";

import { useState, useEffect } from "react";
import { fetchDashboardData, type DashboardData } from "@/services/dashboard";
import { createLogger } from "@/lib/logger";

const log = createLogger("useDashboardData");

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const result = await fetchDashboardData();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to load dashboard data"));
          log.error("Failed to load dashboard data", { error: err });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
