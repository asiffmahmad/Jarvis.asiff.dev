/**
 * JARVIS Route-Level Loading UI
 *
 * Displayed during Next.js route transitions.
 */

import { SkeletonCard } from "@/components/loading/skeleton-card";

export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-40 skeleton rounded-[8px] mb-2" />
        <div className="h-4 w-64 skeleton rounded-[6px]" />
      </div>

      {/* Widget grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>

      {/* System health skeleton */}
      <div>
        <div className="h-4 w-32 skeleton rounded-[6px] mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={1} />
          ))}
        </div>
      </div>
    </div>
  );
}
