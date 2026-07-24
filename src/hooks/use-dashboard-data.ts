"use client";

import type { DashboardData } from "@/services/dashboard";

export function useDashboardData() {
  return { data: null as DashboardData | null, isLoading: false, error: null };
}
