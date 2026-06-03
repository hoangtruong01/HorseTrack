"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, Gauge, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ParticipantTable } from "@/features/races/components/participant-table";
import { RaceScheduleCard } from "@/features/races/components/race-schedule-card";
import { RaceStatusTimeline } from "@/features/races/components/race-status-timeline";
import type { Race, RaceStatus } from "@/features/races/mock-races";

const statusTone: Record<RaceStatus, "red" | "yellow" | "slate" | "teal"> = {
  scheduled: "yellow",
  live: "red",
  finished: "slate",
  result_published: "teal",
};

export type RaceDetailPanelProps = { race: Race };

export function RaceDetailPanel({ race }: RaceDetailPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:p-6 lg:p-8">
        <div className="absolute inset-0 dark:bg-[linear-gradient(120deg,rgba(225,6,0,0.24),transparent_36%),radial-gradient(circle_at_82%_16%,rgba(6,126,106,0.18),transparent_26rem)] bg-card" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <StatusBadge
              label={t(`pages.admin.mockRaces.status.${race.status}`)}
              tone={statusTone[race.status]}
              pulse={race.status === "live"}
            />
            <h1 className="mt-5 text-3xl font-black uppercase leading-tight tracking-tight dark:text-white text-foreground sm:text-5xl">
              {race.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("pages.admin.mockRaces.detailDescription")}
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Gauge className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {t("pages.admin.mockRaces.distance")}
                </p>
                <p className="font-black dark:text-white text-foreground">{race.distance}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {t("pages.admin.mockRaces.participantsLabel")}
                </p>
                <p className="font-black dark:text-white text-foreground">
                  {race.participants.length}/{race.capacity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClipboardList className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {t("pages.admin.mockRaces.tournament")}
                </p>
                <p className="font-black dark:text-white text-foreground">{race.tournament}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <RaceScheduleCard race={race} />
        <RaceStatusTimeline steps={race.timeline} />
      </div>

      <ParticipantTable participants={race.participants} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.mockRaces.refereeSummary")}
          </p>
          <h2 className="mt-2 text-xl font-black uppercase dark:text-white text-foreground">
            {race.referee.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {race.referee.license} · {race.referee.status}
          </p>
        </div>
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.mockRaces.quickActions")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/admin/races/${race.id}/participants`}>
                {t("pages.admin.mockRaces.viewParticipants")} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/admin/races/${race.id}/assignments`}>
                {t("pages.admin.mockRaces.assignments")}
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("pages.admin.mockRaces.quickActionsHint")}
          </p>
        </div>
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.mockRaces.metadata")}
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Created by</dt>
              <dd className="font-bold dark:text-white text-foreground">
                {race.metadata.createdBy}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created at</dt>
              <dd className="font-bold dark:text-white text-foreground">
                {race.metadata.createdAt}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Steward note</dt>
              <dd className="font-bold dark:text-white text-foreground">
                {race.metadata.stewardNote}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
