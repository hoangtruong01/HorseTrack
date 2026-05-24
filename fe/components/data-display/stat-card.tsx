import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type StatCardTone = "red" | "teal" | "yellow" | "neutral";

export type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
  icon: LucideIcon;
  tone?: StatCardTone;
  className?: string;
};

const toneClassName: Record<StatCardTone, string> = {
  red: "border-primary/45 bg-primary/10 text-primary shadow-[0_0_28px_rgba(225,6,0,0.18)]",
  teal: "border-[#067E6A]/50 bg-[#067E6A]/12 text-[#49D6BE] shadow-[0_0_28px_rgba(6,126,106,0.14)]",
  yellow:
    "border-[#F8CD46]/50 bg-[#F8CD46]/12 text-[#F8CD46] shadow-[0_0_28px_rgba(248,205,70,0.12)]",
  neutral: "border-white/15 bg-white/[0.04] text-white",
};

const railClassName: Record<StatCardTone, string> = {
  red: "from-primary via-primary/70",
  teal: "from-[#067E6A] via-[#49D6BE]/70",
  yellow: "from-[#F8CD46] via-[#F8CD46]/70",
  neutral: "from-white via-white/50",
};

export function StatCard({
  label,
  value,
  helper,
  trend,
  icon: Icon,
  tone = "neutral",
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-[#1C1C25]/92 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-0.5 hover:border-white/25 sm:p-5",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent",
          railClassName[tone],
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg border p-2.5 transition duration-200 group-hover:scale-105",
            toneClassName[tone],
          )}
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-5 text-muted-foreground">{helper}</p>
      {trend ? (
        <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white/80">
          {trend}
        </p>
      ) : null}
    </article>
  );
}
