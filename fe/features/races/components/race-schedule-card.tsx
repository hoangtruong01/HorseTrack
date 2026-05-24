import { CalendarClock, MapPin, Route, ShieldCheck } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type { Race, RaceStatus } from "@/features/races/mock-races";

const statusTone: Record<RaceStatus, "red" | "yellow" | "slate" | "teal"> = {
  scheduled: "yellow",
  live: "red",
  finished: "slate",
  result_published: "teal",
};

const statusLabel: Record<RaceStatus, string> = {
  scheduled: "Scheduled",
  live: "Live",
  finished: "Finished",
  result_published: "Result published",
};

export type RaceScheduleCardProps = { race: Race };

export function RaceScheduleCard({ race }: RaceScheduleCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C25] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.3)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_10%,rgba(225,6,0,0.18),transparent_20rem)]" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race schedule
          </p>
          <StatusBadge
            label={statusLabel[race.status]}
            tone={statusTone[race.status]}
            pulse={race.status === "live"}
          />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <CalendarClock className="size-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Date / window
            </p>
            <p className="mt-1 text-lg font-black text-white">{race.date}</p>
            <p className="text-sm text-muted-foreground">
              {race.startTime} → {race.endTime}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <MapPin className="size-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Location
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {race.location}
            </p>
            <p className="text-sm text-muted-foreground">{race.track}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <Route className="size-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Course
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {race.distance}
            </p>
            <p className="text-sm text-muted-foreground">{race.surface}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <ShieldCheck className="size-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Referee
            </p>
            <p className="mt-1 text-lg font-black text-white">
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
