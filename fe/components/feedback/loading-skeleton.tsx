import { cn } from "@/lib/utils";

export type LoadingSkeletonProps = {
  rows?: number;
  className?: string;
};

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("grid gap-4", className)} aria-label="Loading content">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="f1-card animate-pulse" aria-hidden="true">
          <div className="h-3 w-24 rounded-full bg-white/10" />
          <div className="mt-4 h-6 w-2/3 rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-full rounded-full bg-white/10" />
          <div className="mt-2 h-4 w-4/5 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}
