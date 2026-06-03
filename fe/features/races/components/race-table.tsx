"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Race, RaceStatus } from "@/features/races/mock-races";

const statusTone: Record<
  RaceStatus,
  "red" | "yellow" | "green" | "slate" | "teal"
> = {
  scheduled: "yellow",
  live: "red",
  finished: "slate",
  result_published: "teal",
};

const statusPulse: Partial<Record<RaceStatus, boolean>> = {
  live: true,
};

const DEMO_ROW_LIMIT = 6;

export type RaceTableProps = { races: Race[]; limit?: number };

export function RaceTable({ races, limit = DEMO_ROW_LIMIT }: RaceTableProps) {
  const { t } = useTranslation();
  const visibleRaces = races.slice(0, limit);

  return (
    <section className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.mockRaces.tableEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground">
            {t("pages.admin.mockRaces.tableTitle")}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("pages.admin.mockRaces.tableFooter", {
            shown: visibleRaces.length,
            total: races.length,
          })}
        </p>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border dark:border-white/10 border-border">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="dark:bg-white/[0.04] bg-muted/50 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colRace")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colStatus")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colSchedule")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colTrack")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colParticipants")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:bg-black/10 bg-muted/20">
            {visibleRaces.map((race) => (
              <tr key={race.id} className="transition hover:dark:bg-white/[0.04] bg-muted/50">
                <td className="px-4 py-4">
                  <p className="font-black uppercase dark:text-white text-foreground">{race.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {race.tournament}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={t(`pages.admin.mockRaces.status.${race.status}`)}
                    tone={statusTone[race.status]}
                    pulse={statusPulse[race.status]}
                  />
                </td>
                <td className="px-4 py-4 dark:text-white/80 text-muted-foreground">
                  {race.date}
                  <br />
                  <span className="text-muted-foreground">
                    {race.startTime} → {race.endTime}
                  </span>
                </td>
                <td className="px-4 py-4 dark:text-white/80 text-muted-foreground">
                  {race.track}
                  <br />
                  <span className="font-mono text-muted-foreground">
                    {race.distance}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono font-bold dark:text-white text-foreground">
                  {race.participants.length}/{race.capacity}
                </td>
                <td className="px-4 py-4">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/admin/races/${race.id}`}>
                      {t("pages.admin.mockRaces.manage")} <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
