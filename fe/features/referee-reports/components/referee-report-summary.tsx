import { ClipboardCheck, FileText } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type {
  RefereeReport,
  ResultEntryStatus,
} from "@/features/referee-reports/mock-referee-data";

const statusMeta: Record<
  ResultEntryStatus,
  { label: string; tone: "slate" | "green" | "teal" }
> = {
  draft: { label: "Draft / awaiting confirm", tone: "slate" },
  referee_confirmed: { label: "Referee confirmed", tone: "green" },
  published: { label: "Published", tone: "teal" },
};

export type RefereeReportSummaryProps = {
  report: RefereeReport;
};

export function RefereeReportSummary({ report }: RefereeReportSummaryProps) {
  const meta = statusMeta[report.confirmationStatus];

  return (
    <article className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/90 bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            <FileText className="size-4" /> Referee report
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase dark:text-white text-foreground">
            {report.race}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.tournament}
          </p>
        </div>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Referee
          </dt>
          <dd className="mt-2 font-black dark:text-white text-foreground">{report.referee}</dd>
        </div>
        <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Checks
          </dt>
          <dd className="mt-2 font-mono text-2xl font-black dark:text-white text-foreground">
            {report.checklistComplete}/{report.checklistTotal}
          </dd>
        </div>
        <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Violations
          </dt>
          <dd className="mt-2 font-mono text-2xl font-black dark:text-white text-foreground">
            {report.violationCount}
          </dd>
        </div>
        <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Submitted
          </dt>
          <dd className="mt-2 font-bold dark:text-white text-foreground">{report.submittedAt}</dd>
        </div>
      </dl>
      <p className="mt-5 rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
        <ClipboardCheck className="mr-2 inline size-4 text-primary" />
        {report.summary}
      </p>
    </article>
  );
}
