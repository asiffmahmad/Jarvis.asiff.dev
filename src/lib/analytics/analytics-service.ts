import type { AnalyticsDashboard, DateRange, AnalyticsCategory, MetricDataPoint, KPICardData, TopContentItem } from "./types";

/**
 * Mock Analytics Service
 * Generates dynamic mock data for the BI Center.
 */
export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Generate random data points for the main chart
  private generateTimeSeriesData(points: number, startVal: number, volatility: number, compare: boolean = false): MetricDataPoint[] {
    const data: MetricDataPoint[] = [];
    let current = startVal;
    let compareCurrent = startVal * 0.8; // Compare is slightly lower usually

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * volatility;
      current += change;
      
      const point: MetricDataPoint = {
        date: `Day ${i + 1}`,
        value: Math.max(0, Math.floor(current))
      };

      if (compare) {
        compareCurrent += (Math.random() - 0.5) * volatility;
        point.compareValue = Math.max(0, Math.floor(compareCurrent));
      }

      data.push(point);
    }
    return data;
  }

  // Generate a KPI Card
  private generateKPI(id: string, title: string, baseValue: number, prefix = "", suffix = ""): KPICardData {
    const change = (Math.random() - 0.2) * 15; // -3 to 12% change
    return {
      id,
      title,
      value: `${prefix}${Math.floor(baseValue).toLocaleString()}${suffix}`,
      changePercent: Number(change.toFixed(1)),
      isPositive: change >= 0,
      trendData: this.generateTimeSeriesData(7, baseValue * 0.1, baseValue * 0.02)
    };
  }

  public getDashboard(category: AnalyticsCategory, range: DateRange): AnalyticsDashboard {
    
    // Determine points based on range
    let points = 7;
    if (range === "30D") points = 30;
    if (range === "90D") points = 90;
    if (range === "YTD") points = 180;
    if (range === "ALL") points = 365;

    let kpis: KPICardData[] = [];
    let primaryChart: MetricDataPoint[] = [];
    let topContent: TopContentItem[] = [];

    const now = new Date();

    switch (category) {
      case "SOCIAL":
        kpis = [
          this.generateKPI("kpi_1", "Total Followers", 45200),
          this.generateKPI("kpi_2", "Total Reach", 1250000),
          this.generateKPI("kpi_3", "Engagement Rate", 4.2, "", "%"),
        ];
        primaryChart = this.generateTimeSeriesData(points, 5000, 500, true);
        topContent = [
          { id: "c1", title: "Introducing JARVIS OS", type: "Video", platform: "Twitter", views: 45000, engagement: 1200, date: now },
          { id: "c2", title: "Why Next.js is the future", type: "Carousel", platform: "LinkedIn", views: 32000, engagement: 850, date: now },
        ];
        break;

      case "EMAIL":
        kpis = [
          this.generateKPI("kpi_1", "Total Subscribers", 12400),
          this.generateKPI("kpi_2", "Avg Open Rate", 48.5, "", "%"),
          this.generateKPI("kpi_3", "Click Rate", 12.1, "", "%"),
        ];
        primaryChart = this.generateTimeSeriesData(points, 2000, 200, true);
        topContent = [
          { id: "c1", title: "Newsletter Issue #45", type: "Email", platform: "Mail", views: 11000, engagement: 4500, date: now },
        ];
        break;

      default:
        // Generic fallback
        kpis = [
          this.generateKPI("kpi_1", "Total Views", 85000),
          this.generateKPI("kpi_2", "Active Users", 1200),
        ];
        primaryChart = this.generateTimeSeriesData(points, 1000, 100);
        break;
    }

    return {
      category,
      kpis,
      primaryChart,
      topContent
    };
  }
}
