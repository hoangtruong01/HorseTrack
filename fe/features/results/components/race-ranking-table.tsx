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

export type RaceRankingTableProps = {
  rankings: RaceRanking[];
  raceName: string;
};

export function RaceRankingTable({
  rankings,
  raceName,
}: RaceRankingTableProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race ranking
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
            {raceName}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="size-4 text-primary" /> Per-race ranking only
        </div>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Horse</th>
              <th className="px-4 py-3">Jockey</th>
              <th className="px-4 py-3">Finish time</th>
              <th className="px-4 py-3">Penalty</th>
              <th className="px-4 py-3">Final status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-black/10">
            {rankings.map((row) => (
              <tr key={row.id} className="transition hover:bg-white/[0.04]">
                <td className="px-4 py-4">
                  <span className="font-mono text-2xl font-black text-white">
                    #{row.rank}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black uppercase text-white">{row.horse}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {row.horseCode}
                  </p>
                </td>
                <td className="px-4 py-4 text-white/80">{row.jockey}</td>
                <td className="px-4 py-4 font-mono font-black text-white">
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
