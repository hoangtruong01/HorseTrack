import { MapPin, RadioTower, Timer, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type {
  RaceStatus,
  RaceSummary,
} from "@/features/dashboard/mock-admin-dashboard";

export type RaceStatusOverviewProps = {
  races: RaceSummary[];
  counts: Record<RaceStatus, number>;
};

const statusMeta: Record<
  RaceStatus,
  { label: string; className: string; marker: string }
> = {
  live: {
    label: "Live",
    className: "f1-status-live",
    marker: "bg-primary shadow-[0_0_18px_rgba(225,6,0,0.64)]",
  },
  upcoming: {
    label: "Upcoming",
    className: "f1-status-upcoming",
    marker: "bg-[#F8CD46]",
  },
  finished: {
    label: "Finished",
    className: "f1-status-finished",
    marker: "bg-muted/55",
  },
};

export function RaceStatusOverview({ races, counts }: RaceStatusOverviewProps) {
  const { t } = useTranslation();

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.4fr]">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.32)] dark:shadow-[0_18px_56px_rgba(0,0,0,0.32)] sm:p-6">
        <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("admin.raceStatus.eyebrow", "Race status radar")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            {t("admin.raceStatus.title", "Control tower")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {t("admin.raceStatus.description", "One-screen status summary for independent races. No rounds, no stage progression.")}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {Object.entries(counts).map(([status, count]) => {
              const meta = statusMeta[status as RaceStatus];

              return (
                <div
                  key={status}
                  className="rounded-xl border border-border bg-muted p-3 text-center"
                >
                  <p className="text-3xl font-black leading-none text-foreground">
                    {count}
                  </p>
                  <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {t(`admin.raceStatus.status.${status}`, meta.label)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-foreground">
              <RadioTower className="size-4 text-primary" />
              {t("admin.raceStatus.livePriorityTitle", "Live priority")}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("admin.raceStatus.livePriorityDesc", "Live races stay visually dominant so admin can jump to monitoring, registration impact, and result readiness.")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {t("admin.raceStatus.listEyebrow", "Upcoming / live / finished")}
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
              {t("admin.raceStatus.listTitle", "Race summary")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("admin.raceStatus.listSubtitle", "Mock data only")}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {races.map((race) => {
            const meta = statusMeta[race.status];

            return (
              <article
                key={race.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-muted p-4 transition duration-200 hover:border-primary/30 hover:bg-muted/80"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={meta.className}>
                        {t(`admin.raceStatus.status.${race.status}`, meta.label)}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        {t(`admin.raceStatus.raceMock.${race.key}.tournament`, race.tournament)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-black uppercase tracking-tight text-foreground">
                      {t(`admin.raceStatus.raceMock.${race.key}.name`, race.name)}
                    </h3>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                      <span className="inline-flex items-center gap-2">
                        <Timer className="size-4 text-muted-foreground" />
                        {t(`admin.raceStatus.raceMock.${race.key}.startLabel`, race.startLabel)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        {t(`admin.raceStatus.raceMock.${race.key}.track`, race.track)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        {race.horses} {t("admin.raceStatus.horsesUnit", "horses")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 lg:max-w-52">
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        meta.marker,
                      )}
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold leading-5 text-foreground/70">
                      {t(`admin.raceStatus.raceMock.${race.key}.adminNote`, race.adminNote)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
