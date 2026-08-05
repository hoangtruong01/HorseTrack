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
  red: "border-red-500/50 bg-red-500/20 text-red-900 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-300 font-bold",
  yellow:
    "border-amber-500/50 bg-amber-500/20 text-amber-950 dark:border-[#F8CD46]/50 dark:bg-[#F8CD46] dark:text-[#1C1C25] font-bold",
  amber:
    "border-amber-500/50 bg-amber-500/20 text-amber-950 dark:border-amber-400/50 dark:bg-amber-400/20 dark:text-amber-300 font-bold",
  green:
    "border-emerald-600/50 bg-emerald-500/20 text-emerald-950 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-200 font-bold",
  blue:
    "border-blue-500/50 bg-blue-500/20 text-blue-950 dark:border-blue-400/50 dark:bg-blue-500/20 dark:text-blue-300 font-bold",
  purple:
    "border-purple-500/50 bg-purple-500/20 text-purple-950 dark:border-purple-400/50 dark:bg-purple-500/20 dark:text-purple-300 font-bold",
  rose:
    "border-rose-500/50 bg-rose-500/20 text-rose-950 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300 font-bold",
  orange:
    "border-orange-500/50 bg-orange-500/20 text-orange-950 dark:border-orange-500/40 dark:bg-orange-500/20 dark:text-orange-300 font-bold",
  slate:
    "border-slate-500/40 bg-slate-500/20 text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-white/80 font-bold",
  teal:
    "border-[#067E6A]/50 bg-teal-500/20 text-teal-950 dark:border-[#067E6A]/50 dark:bg-[#067E6A]/25 dark:text-teal-100 font-bold",
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
