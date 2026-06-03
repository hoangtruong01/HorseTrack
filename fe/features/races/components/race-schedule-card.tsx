"use client";

import { CalendarClock, MapPin, Route, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/ui/status-badge";
import type { Race, RaceStatus } from "@/features/races/mock-races";

const statusTone: Record<RaceStatus, "red" | "yellow" | "slate" | "teal"> = {
  scheduled: "yellow",
  live: "red",
  finished: "slate",
  result_published: "teal",
};

export type RaceScheduleCardProps = { race: Race };

export function RaceScheduleCard({ race }: RaceScheduleCardProps) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#1C1C25] bg-card p-5 shadow-[0_20px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_64px_rgba(0,0,0,0.3)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_10%,rgba(225,6,0,0.18),transparent_20rem)]" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.mockRaces.scheduleEyebrow")}
          </p>
          <StatusBadge
            label={t(`pages.admin.mockRaces.status.${race.status}`)}
            tone={statusTone[race.status]}
            pulse={race.status === "live"}
          />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4">
            <CalendarClock className="size-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t("pages.admin.mockRaces.dateWindow")}
            </p>
            <p className="mt-1 text-lg font-black dark:text-white text-foreground">{race.date}</p>
            <p className="text-sm text-muted-foreground">
              {race.startTime} → {race.endTime}
            </p>
          </div>
          <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4">
            <MapPin className="size-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t("pages.admin.mockRaces.location")}
            </p>
            <p className="mt-1 text-lg font-black dark:text-white text-foreground">
              {race.location}
            </p>
            <p className="text-sm text-muted-foreground">{race.track}</p>
          </div>
          <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4">
            <Route className="size-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t("pages.admin.mockRaces.course")}
            </p>
            <p className="mt-1 text-lg font-black dark:text-white text-foreground">
              {race.distance}
            </p>
            <p className="text-sm text-muted-foreground">{race.surface}</p>
          </div>
          <div className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4">
            <ShieldCheck className="size-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t("pages.admin.mockRaces.referee")}
            </p>
            <p className="mt-1 text-lg font-black dark:text-white text-foreground">
              {race.referee.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {race.referee.status}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
