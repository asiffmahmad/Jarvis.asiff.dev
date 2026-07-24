import { contentService } from "@/lib/studio/content-service";
import type { Platform } from "@/lib/studio/types";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface ContentScoreProps {
  content: string;
  platform: Platform;
}

export function ContentScorePanel({ content, platform }: ContentScoreProps) {
  const score = contentService.analyzeContent(content, platform);

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-jarvis-text-primary uppercase tracking-wider text-sm border-b border-jarvis-border/30 pb-2">
        Analytics & SEO
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Characters" value={score.characterCount.toString()} />
        <MetricCard label="Words" value={score.wordCount.toString()} />
        <MetricCard label="Reading Time" value={`${score.readingTimeMinutes}m`} />
        <MetricCard 
          label="AI Quality" 
          value={`${score.aiQualityScore}`} 
          highlight={score.aiQualityScore > 85 ? "success" : "warning"} 
        />
      </div>

      {!score.platformCompatibility && score.issues.length > 0 && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <ul className="space-y-1">
            {score.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {score.platformCompatibility && content.length > 0 && (
        <div className="mt-4 p-3 bg-jarvis-glow-primary/10 border border-jarvis-glow-primary/30 rounded-xl flex items-center gap-3 text-jarvis-glow-primary text-sm">
          <CheckCircle size={16} className="shrink-0" />
          <span>Ready for {platform}</span>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: "success" | "warning" }) {
  return (
    <div className="bg-black/20 border border-jarvis-border/30 p-3 rounded-xl flex flex-col justify-center items-center">
      <span className="text-xs text-jarvis-text-secondary uppercase tracking-wider mb-1 text-center">
        {label}
      </span>
      <span 
        className={`font-heading font-bold text-xl ${
          highlight === "success" ? "text-[#42FF98] drop-shadow-[0_0_10px_rgba(66,255,152,0.5)]" 
          : highlight === "warning" ? "text-[#F8E36B] drop-shadow-[0_0_10px_rgba(248,227,107,0.5)]"
          : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
