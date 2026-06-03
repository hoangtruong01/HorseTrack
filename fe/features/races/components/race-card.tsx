"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Timer, Users } from "lucide-react";
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

export type RaceCardProps = {
  race: Race;
};

export function RaceCard({ race }: RaceCardProps) {
  const { t } = useTranslation();

  return (
    <article className="group relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] transition duration-200 hover:border-primary/40 dark:hover:bg-[#1C1C25] hover:bg-muted/80">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-white/20 to-transparent" />
      <div className="absolute -right-12 -top-12 size-36 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/20" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge
            label={t(`pages.admin.mockRaces.status.${race.status}`)}
            tone={statusTone[race.status]}
            pulse={statusPulse[race.status]}
          />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {race.tournament}
          </span>
        </div>
        <h2 className="mt-5 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground">
          {race.name}
        </h2>
        <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="inline-flex items-center gap-2">
            <Timer className="size-4 text-primary" />
            {race.date} · {race.startTime}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {race.location}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="size-4 text-primary" />
            {t("pages.admin.mockRaces.participantsCount", {
              current: race.participants.length,
              capacity: race.capacity,
            })}
          </span>
          <span className="font-mono dark:text-white/75 text-muted-foreground">
            {race.distance} · {race.surface}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-full">
            <Link href={`/admin/races/${race.id}`}>
              {t("pages.admin.mockRaces.openRace")} <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/admin/races/${race.id}/participants`}>
              {t("pages.admin.mockRaces.participants")}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
