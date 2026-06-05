import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type {
  ChecklistStatus,
  RaceChecklistItem,
} from "@/features/referee-reports/mock-referee-data";

const statusMeta: Record<
  ChecklistStatus,
  {
    label: string;
    tone: "green" | "yellow" | "slate";
    icon: typeof CheckCircle2;
  }
> = {
  complete: { label: "Complete", tone: "green", icon: CheckCircle2 },
  attention: { label: "Attention", tone: "yellow", icon: AlertTriangle },
  pending: { label: "Pending", tone: "slate", icon: Circle },
};

export type RaceChecklistProps = {
  items: RaceChecklistItem[];
};

export function RaceChecklist({ items }: RaceChecklistProps) {
  const completed = items.filter((item) => item.status === "complete").length;

  return (
    <section className="rounded-2xl border border-border/10 bg-[#15151E]/90 p-4 shadow-[0_18px_56px_rgba(0,0,0,0.3)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Pre-race checklist
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            Race readiness grid
          </h2>
        </div>
        <StatusBadge
          label={`${completed}/${items.length} checks`}
          tone={completed === items.length ? "green" : "yellow"}
        />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const meta = statusMeta[item.status];
          const Icon = meta.icon;
          return (
            <article
              key={item.id}
              className={cn(
                "rounded-xl border p-4",
                item.status === "attention"
                  ? "border-[#F8CD46]/35 bg-[#F8CD46]/10"
                  : "border-border/10 bg-black/20",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <Icon
                  className={cn(
                    "mt-1 size-5",
                    item.status === "complete"
                      ? "text-emerald-300"
                      : item.status === "attention"
                        ? "text-[#F8CD46]"
                        : "text-white/35",
                  )}
                />
                <StatusBadge label={meta.label} tone={meta.tone} />
              </div>
              <h3 className="mt-4 font-black uppercase text-foreground">
                {item.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.detail}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
