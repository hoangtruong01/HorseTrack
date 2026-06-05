import { Trophy } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type {
  PenaltyStatus,
  RaceRanking,
  ResultStatus,
} from "@/features/results/mock-results";

const penaltyMeta: Record<
  PenaltyStatus,
  { label: string; tone: "green" | "yellow" | "red" }
> = {
  clean: { label: "Clean", tone: "green" },
  warning: { label: "Warning", tone: "yellow" },
  penalty: { label: "Penalty", tone: "red" },
};

const resultMeta: Record<
  ResultStatus,
  { label: string; tone: "slate" | "green" | "teal" }
> = {
  draft: { label: "Draft", tone: "slate" },
  referee_confirmed: { label: "Referee confirmed", tone: "green" },
  published: { label: "Published", tone: "teal" },
};

const DEMO_ROW_LIMIT = 8;

export type RaceRankingTableProps = {
  rankings: RaceRanking[];
  raceName: string;
  limit?: number;
};

export function RaceRankingTable({
  rankings,
  raceName,
  limit = DEMO_ROW_LIMIT,
}: RaceRankingTableProps) {
  const visibleRankings = rankings.slice(0, limit);
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race ranking
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            {raceName}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="size-4 text-primary" /> Showing{" "}
          {visibleRankings.length}/{rankings.length}
        </div>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Horse</th>
              <th className="px-4 py-3">Jockey</th>
              <th className="px-4 py-3">Finish time</th>
              <th className="px-4 py-3">Penalty</th>
              <th className="px-4 py-3">Final status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {visibleRankings.map((row) => (
              <tr key={row.id} className="transition hover:bg-muted/[0.04]">
                <td className="px-4 py-4">
                  <span className="font-mono text-2xl font-black text-foreground">
                    #{row.rank}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black uppercase text-foreground">{row.horse}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {row.horseCode}
                  </p>
                </td>
                <td className="px-4 py-4 text-muted-foreground">{row.jockey}</td>
                <td className="px-4 py-4 font-mono font-black text-foreground">
                  {row.finishTime}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={penaltyMeta[row.penaltyStatus].label}
                    tone={penaltyMeta[row.penaltyStatus].tone}
                  />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={resultMeta[row.finalStatus].label}
                    tone={resultMeta[row.finalStatus].tone}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
