/**
 * JARVIS Skeleton Component
 *
 * Loading skeleton with cyan shimmer animation matching the JARVIS aesthetic.
 */

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[12px] skeleton",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
