import { useState, useMemo, useEffect } from "react";
import { AnalyticsService } from "./analytics-service";
import type { AnalyticsCategory, DateRange, AnalyticsDashboard } from "./types";

export type AnalyticsState = ReturnType<typeof useAnalytics>;

export function useAnalytics() {
  const [category, setCategory] = useState<AnalyticsCategory>("SOCIAL");
  const [dateRange, setDateRange] = useState<DateRange>("7D");
  
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const service = useMemo(() => AnalyticsService.getInstance(), []);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    
    // Simulate slight network delay for realistic feel
    const timer = setTimeout(() => {
      if (mounted) {
        setDashboard(service.getDashboard(category, dateRange));
        setIsLoading(false);
      }
    }, 400);

    return () => { 
      mounted = false;
      clearTimeout(timer);
    };
  }, [category, dateRange, service]);

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDashboard(service.getDashboard(category, dateRange));
      setIsLoading(false);
    }, 400);
  };

  return {
    category,
    setCategory,
    dateRange,
    setDateRange,
    dashboard,
    isLoading,
    refresh
  };
}
