import { cn } from "@/lib/utils";

type StatusBadgeTone = "red" | "yellow" | "green" | "slate" | "teal";

export type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  pulse?: boolean;
  className?: string;
};

const toneClass: Record<StatusBadgeTone, string> = {
  red: "border-primary/50 bg-primary text-primary-foreground",
  yellow: "border-[#F8CD46]/50 bg-[#F8CD46] text-[#1C1C25]",
  green: "border-emerald-400/40 bg-emerald-400/15 dark:text-emerald-200 text-emerald-800",
  slate: "dark:border-white/15 border-border dark:bg-white/10 bg-muted/50 dark:text-white/80 text-muted-foreground",
  teal: "border-[#067E6A]/50 bg-[#067E6A]/25 dark:text-teal-100 text-teal-900",
};

export function StatusBadge({
  label,
  tone = "slate",
  pulse,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-2 rounded-[2px] border px-2.5 py-1 text-[0.68rem] font-black uppercase leading-none tracking-[0.16em]",
        toneClass[tone],
        className,
      )}
    >
      {pulse ? (
        <span
          className="size-1.5 rounded-full bg-current animate-pulse"
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  );
}
