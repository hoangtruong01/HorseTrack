import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type StatCardSemantic = "danger" | "warning" | "success" | "neutral";

export type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
  icon: LucideIcon;
  semantic?: StatCardSemantic;
  className?: string;
};

const semanticConfig: Record<
  StatCardSemantic,
  { rail: string; icon: string; badge: string }
> = {
  danger: {
    rail: "from-red-500 via-red-400",
    icon: "border-red-500/30 bg-red-500/10 text-red-400",
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
  },
  warning: {
    rail: "from-yellow-400 via-yellow-300",
    icon: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
    badge: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
  },
  success: {
    rail: "from-emerald-500 via-emerald-400",
    icon: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  neutral: {
    rail: "from-border via-border/50",
    icon: "border-border bg-muted/50 text-muted-foreground",
    badge: "border-border bg-muted/30 text-foreground/70",
  },
};

export function StatCard({
  label,
  value,
  helper,
  trend,
  icon: Icon,
  semantic = "neutral",
  className,
}: StatCardProps) {
  const cfg = semanticConfig[semantic];

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-border/60",
        className,
      )}
    >
      {/* Top color rail */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r to-transparent",
          cfg.rail,
        )}
      />

      {/* Header: label + icon */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <div
          className={cn(
            "shrink-0 rounded-md border p-1.5 transition-transform duration-150 group-hover:scale-105",
            cfg.icon,
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </div>
      </div>

      {/* Value */}
      <p className="mt-2 text-2xl font-bold leading-none tracking-tight text-foreground">
        {value}
      </p>

      {/* Helper + trend */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="text-xs text-muted-foreground">{helper}</p>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border",
              cfg.badge,
            )}
          >
            {trend}
          </span>
        ) : null}
      </div>
    </article>
  );
}
