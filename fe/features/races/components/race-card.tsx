import Link from "next/link";
import { ArrowRight, MapPin, Timer, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Race, RaceStatus } from "@/features/races/mock-races";

const statusMeta: Record<
  RaceStatus,
  {
    label: string;
    tone: "red" | "yellow" | "green" | "slate" | "teal";
    pulse?: boolean;
  }
> = {
  scheduled: { label: "Scheduled", tone: "yellow" },
  live: { label: "Live", tone: "red", pulse: true },
  finished: { label: "Finished", tone: "slate" },
  result_published: { label: "Result published", tone: "teal" },
};

export type RaceCardProps = {
  race: Race;
};

export function RaceCard({ race }: RaceCardProps) {
  const meta = statusMeta[race.status];

  return (
    <article className="group relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] transition duration-200 hover:border-primary/40 dark:hover:bg-[#1C1C25] hover:bg-muted/80">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-white/20 to-transparent" />
      <div className="absolute -right-12 -top-12 size-36 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/20" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge label={meta.label} tone={meta.tone} pulse={meta.pulse} />
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
            {race.participants.length}/{race.capacity} participants
          </span>
          <span className="font-mono dark:text-white/75 text-muted-foreground">
            {race.distance} · {race.surface}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-full">
            <Link href={`/admin/races/${race.id}`}>
              Open race <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/admin/races/${race.id}/participants`}>
              Participants
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
