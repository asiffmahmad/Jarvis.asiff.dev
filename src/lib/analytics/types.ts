export type DateRange = "7D" | "30D" | "90D" | "YTD" | "ALL";
export type AnalyticsCategory = "SOCIAL" | "CONTENT" | "EMAIL" | "AUDIENCE" | "GROWTH" | "ENGAGEMENT";

export interface MetricDataPoint {
  date: string; // ISO String or short format like "Mon"
  value: number;
  compareValue?: number; // For previous period
}

export interface KPICardData {
  id: string;
  title: string;
  value: string | number;
  changePercent: number;
  isPositive: boolean;
  trendData: MetricDataPoint[];
}

export interface TopContentItem {
  id: string;
  title: string;
  type: string;
  platform: string;
  views: number;
  engagement: number;
  date: Date;
}

export interface AnalyticsDashboard {
  category: AnalyticsCategory;
  kpis: KPICardData[];
  primaryChart: MetricDataPoint[];
  topContent: TopContentItem[];
}
