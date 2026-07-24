"use client";

import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import type { AnalyticsState } from "@/lib/analytics/use-analytics";
import { cn } from "@/lib/utils";
import type { KPICardData } from "@/lib/analytics/types";

interface CenterPanelProps {
  state: AnalyticsState;
}

export function AnalyticsCenterPanel({ state }: CenterPanelProps) {
  const { dashboard, isLoading, category } = state;

  if (isLoading || !dashboard) {
    return (
      <div className="flex-[1.5] h-full flex items-center justify-center bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
        <div className="flex flex-col items-center gap-4 text-jarvis-primary">
          <Loader2 className="size-8 animate-spin" />
          <span className="font-heading uppercase tracking-widest text-xs animate-pulse">Aggregating Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-[1.5] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50 overflow-y-auto">
      
      {/* Header */}
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-6 shrink-0 z-10 backdrop-blur-md">
        <h2 className="text-lg font-bold text-jarvis-text">{category} Dashboard</h2>
      </div>

      <div className="p-6 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboard.kpis.map(kpi => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        {/* Primary Chart */}
        <div className="bg-jarvis-panel/10 border border-jarvis-panel-border/50 rounded-xl p-4 h-[350px]">
          <h3 className="text-sm font-bold text-jarvis-text mb-4">Metric Overview</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboard.primaryChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34F5D0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#34F5D0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10, 15, 20, 0.9)', borderColor: 'rgba(52,245,208,0.2)', borderRadius: '8px' }}
                itemStyle={{ color: '#34F5D0' }}
              />
              <Area type="monotone" dataKey="value" stroke="#34F5D0" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              {dashboard.primaryChart[0]?.compareValue !== undefined && (
                <Area type="monotone" dataKey="compareValue" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Content Table */}
        <div className="bg-jarvis-panel/10 border border-jarvis-panel-border/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-jarvis-panel-border/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-jarvis-text">Top Performing Content</h3>
          </div>
          {dashboard.topContent.length === 0 ? (
            <div className="p-8 text-center text-jarvis-text-muted text-xs italic">No content data available for this period.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-jarvis-panel/30 text-xs uppercase text-jarvis-text-muted font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Views</th>
                  <th className="px-4 py-3 font-medium text-right">Eng.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jarvis-panel-border/30">
                {dashboard.topContent.map(content => (
                  <tr key={content.id} className="hover:bg-jarvis-panel/20 transition-colors">
                    <td className="px-4 py-3 text-jarvis-text">{content.title}</td>
                    <td className="px-4 py-3 text-jarvis-text-muted">
                      <span className="bg-jarvis-panel/50 px-2 py-0.5 rounded text-[10px]">{content.type}</span>
                    </td>
                    <td className="px-4 py-3 text-jarvis-text font-mono text-right">{content.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-jarvis-text font-mono text-right">{content.engagement.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPICardData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-jarvis-panel/10 border border-jarvis-panel-border/50 rounded-xl p-4 flex flex-col relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-jarvis-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <span className="text-xs text-jarvis-text-muted font-bold uppercase tracking-wider mb-2 relative z-10">{kpi.title}</span>
      
      <div className="flex items-end justify-between mb-4 relative z-10">
        <span className="text-2xl font-bold text-jarvis-text">{kpi.value}</span>
        <div className={cn(
          "flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded",
          kpi.isPositive ? "text-[#34F5D0] bg-[#34F5D0]/10" : "text-[#FF4D4D] bg-[#FF4D4D]/10"
        )}>
          {kpi.isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(kpi.changePercent)}%
        </div>
      </div>

      <div className="h-10 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={kpi.trendData}>
            <Bar dataKey="value" fill={kpi.isPositive ? "#34F5D0" : "#FF4D4D"} opacity={0.3} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
