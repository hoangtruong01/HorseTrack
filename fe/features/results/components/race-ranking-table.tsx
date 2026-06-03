"use client";

import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/ui/status-badge";
import type {
  PenaltyStatus,
  RaceRanking,
  ResultStatus,
} from "@/features/results/mock-results";

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
  const { t } = useTranslation();
  const visibleRankings = rankings.slice(0, limit);

  const penaltyLabel = (status: PenaltyStatus) =>
    t(`pages.admin.raceRanking.penalty.${status}`);

  const resultLabel = (status: ResultStatus) =>
    t(`pages.admin.raceRanking.resultStatus.${status}`);

  return (
    <section className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.raceRanking.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground">
            {raceName}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="size-4 text-primary" />
          {t("pages.admin.raceRanking.showing", {
            visible: visibleRankings.length,
            total: rankings.length,
          })}
        </div>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border dark:border-white/10 border-border">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="dark:bg-white/[0.04] bg-muted/50 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("pages.admin.raceRanking.colRank")}</th>
              <th className="px-4 py-3">{t("pages.admin.raceRanking.colHorse")}</th>
              <th className="px-4 py-3">{t("pages.admin.raceRanking.colJockey")}</th>
              <th className="px-4 py-3">{t("pages.admin.raceRanking.colFinishTime")}</th>
              <th className="px-4 py-3">{t("pages.admin.raceRanking.colPenalty")}</th>
              <th className="px-4 py-3">{t("pages.admin.raceRanking.colFinalStatus")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:bg-black/10 bg-muted/20">
            {visibleRankings.map((row) => (
              <tr key={row.id} className="transition hover:dark:bg-white/[0.04] bg-muted/50">
                <td className="px-4 py-4">
                  <span className="font-mono text-2xl font-black dark:text-white text-foreground">
                    #{row.rank}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black uppercase dark:text-white text-foreground">{row.horse}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {row.horseCode}
                  </p>
                </td>
                <td className="px-4 py-4 dark:text-white/80 text-muted-foreground">{row.jockey}</td>
                <td className="px-4 py-4 font-mono font-black dark:text-white text-foreground">
                  {row.finishTime}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={penaltyLabel(row.penaltyStatus)}
                    tone={
                      row.penaltyStatus === "clean"
                        ? "green"
                        : row.penaltyStatus === "warning"
                          ? "yellow"
                          : "red"
                    }
                  />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={resultLabel(row.finalStatus)}
                    tone={
                      row.finalStatus === "published"
                        ? "teal"
                        : row.finalStatus === "referee_confirmed"
                          ? "green"
                          : "slate"
                    }
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
