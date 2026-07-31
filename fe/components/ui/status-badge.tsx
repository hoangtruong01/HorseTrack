import { cn } from "@/lib/utils";

export type StatusBadgeTone =
  | "red"
  | "yellow"
  | "amber"
  | "green"
  | "slate"
  | "teal"
  | "blue"
  | "purple"
  | "rose"
  | "orange";

export type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  pulse?: boolean;
  className?: string;
};

const toneClass: Record<StatusBadgeTone, string> = {
  red: "border-red-500/50 bg-red-500/15 text-red-600 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-300",
  yellow:
    "border-amber-500/40 bg-amber-50 text-amber-900 dark:border-[#F8CD46]/50 dark:bg-[#F8CD46] dark:text-[#1C1C25]",
  amber:
    "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:border-amber-400/50 dark:bg-amber-400/20 dark:text-amber-300",
  green:
    "border-emerald-600/35 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-200",
  blue:
    "border-blue-500/40 bg-blue-50 text-blue-800 dark:border-blue-400/50 dark:bg-blue-500/20 dark:text-blue-300",
  purple:
    "border-purple-500/40 bg-purple-50 text-purple-800 dark:border-purple-400/50 dark:bg-purple-500/20 dark:text-purple-300",
  rose:
    "border-rose-500/40 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300",
  orange:
    "border-orange-500/40 bg-orange-50 text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/20 dark:text-orange-300",
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
        "inline-flex min-h-6 items-center gap-1.5 rounded-[4px] border px-2.5 py-0.5 text-[0.68rem] font-black uppercase leading-none tracking-[0.12em]",
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
