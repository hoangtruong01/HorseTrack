import { AlertOctagon, AlertTriangle, Siren } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type {
  RaceViolation,
  ViolationSeverity,
} from "@/features/referee-reports/mock-referee-data";

const severityMeta: Record<
  ViolationSeverity,
  { label: string; tone: "yellow" | "red"; icon: typeof AlertTriangle }
> = {
  warning: { label: "Warning", tone: "yellow", icon: AlertTriangle },
  penalty: { label: "Penalty", tone: "red", icon: AlertOctagon },
  critical: { label: "Critical", tone: "red", icon: Siren },
};

export type ViolationListProps = {
  violations: RaceViolation[];
};

export function ViolationList({ violations }: ViolationListProps) {
  return (
    <section className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/90 bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Violation log
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase dark:text-white text-foreground">
            Steward notes
          </h2>
        </div>
        <StatusBadge
          label={`${violations.length} logged`}
          tone={violations.length ? "yellow" : "green"}
        />
      </div>
      <div className="mt-5 space-y-3">
        {violations.length ? (
          violations.map((violation) => {
            const meta = severityMeta[violation.severity];
            const Icon = meta.icon;
            return (
              <article
                key={violation.id}
                className="grid gap-4 rounded-xl border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 p-4 md:grid-cols-[7rem_1fr_auto] md:items-center"
              >
                <div className="font-mono text-2xl font-black dark:text-white text-foreground">
                  {violation.time}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <h3 className="font-black uppercase dark:text-white text-foreground">
                      {violation.horse}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      · {violation.jockey}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {violation.note}
                  </p>
                </div>
                <StatusBadge label={meta.label} tone={meta.tone} />
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-100">
            No violations logged for this mock race.
          </div>
        )}
      </div>
    </section>
  );
}
