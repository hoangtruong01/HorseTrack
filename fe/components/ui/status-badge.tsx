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
  yellow:
    "border-amber-500/40 bg-amber-50 text-amber-900 dark:border-[#F8CD46]/50 dark:bg-[#F8CD46] dark:text-[#1C1C25]",
  green:
    "border-emerald-600/35 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-200",
  slate:
    "border-border bg-muted text-muted-foreground dark:border-white/15 dark:bg-white/10 dark:text-white/80",
  teal:
    "border-[#067E6A]/40 bg-teal-50 text-teal-900 dark:border-[#067E6A]/50 dark:bg-[#067E6A]/25 dark:text-teal-100",
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
      <span>{label}</span>
    </span>
  );
}
